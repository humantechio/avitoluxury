'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiUser, FiPhone, FiCalendar, FiCheck, FiX, FiEye } from 'react-icons/fi';
import AdminLayout from '@/app/components/AdminLayout';
import { useAdminAuth, getAdminToken } from '@/app/lib/admin-auth';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'responded';
  createdAt: string;
}

export default function AdminContactsPage() {
  const router = useRouter();
  const { loading: authLoading } = useAdminAuth();
  
  // State variables
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Fetch contacts when component mounts
  useEffect(() => {
    if (!authLoading) {
      fetchContacts();
    }
  }, [currentPage, statusFilter, authLoading]);
  
  // Fetch contact submissions from the API
  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Get admin token
      const token = getAdminToken();
      if (!token) {
        setError('Authentication failed. Please log in again.');
        return;
      }
      
      // Build query string
      let queryString = `?page=${currentPage}&limit=10`;
      if (statusFilter) {
        queryString += `&status=${statusFilter}`;
      }
      
      const response = await fetch(`/api/contact${queryString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact submissions');
      }
      
      const result = await response.json();
      
      setContacts(result.data);
      setTotalPages(result.pagination.pages);
      
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setError(error.message || 'An error occurred while fetching contacts');
    } finally {
      setLoading(false);
    }
  };
  
  // Update contact status
  const updateContactStatus = async (id: string, status: 'pending' | 'read' | 'responded') => {
    try {
      // Get admin token
      const token = getAdminToken();
      if (!token) {
        setError('Authentication failed. Please log in again.');
        return;
      }
      
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update contact status');
      }
      
      // Update local state
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === id ? { ...contact, status } : contact
        )
      );
      
      // If viewing a contact in modal, update that too
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact({ ...selectedContact, status });
      }
      
    } catch (error: any) {
      console.error('Error updating contact status:', error);
      alert(error.message || 'An error occurred while updating the contact');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // View contact details
  const viewContact = async (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setShowModal(true);
    
    // If contact is pending, mark it as read
    if (contact.status === 'pending') {
      await updateContactStatus(contact._id, 'read');
    }
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <AdminLayout activeRoute="/admin/contacts">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Submissions</h1>
        
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
          </select>
          
          <button
            onClick={fetchContacts}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No contact submissions found.</p>
        </div>
      ) : (
        <>
          {/* Contact List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{contact.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiCalendar className="mr-1" /> {formatDate(contact.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contact.status)}`}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewContact(contact)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => updateContactStatus(contact._id, 'responded')}
                        className={`text-green-600 hover:text-green-900 ${contact.status === 'responded' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={contact.status === 'responded'}
                      >
                        Mark Responded
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
      
      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <FiUser className="text-gray-400 mr-2" />
                    <span>{selectedContact.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <FiMail className="text-gray-400 mr-2" />
                    <span>{selectedContact.email}</span>
                  </div>
                </div>
                
                {selectedContact.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FiPhone className="text-gray-400 mr-2" />
                      <span>{selectedContact.phone}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <FiCalendar className="text-gray-400 mr-2" />
                    <span>{formatDate(selectedContact.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {selectedContact.subject}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center">
                  <span className="mr-2">Status:</span>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedContact.status)}`}>
                    {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => updateContactStatus(selectedContact._id, 'read')}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                      selectedContact.status === 'read' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={selectedContact.status === 'read'}
                  >
                    <FiCheck className="mr-1" /> Mark as Read
                  </button>
                  
                  <button
                    onClick={() => updateContactStatus(selectedContact._id, 'responded')}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 ${
                      selectedContact.status === 'responded' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={selectedContact.status === 'responded'}
                  >
                    <FiCheck className="mr-1" /> Mark as Responded
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 