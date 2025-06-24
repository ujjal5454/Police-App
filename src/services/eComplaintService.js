import { openDB } from 'idb';

const DB_NAME = 'EComplaintDB';
const DB_VERSION = 1;
const STORE_NAME = 'complaints';

class EComplaintService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, {
              keyPath: 'id',
              autoIncrement: true
            });
            
            // Create indexes for efficient querying
            store.createIndex('userId', 'userId', { unique: false });
            store.createIndex('complaintType', 'complaintType', { unique: false });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('location', 'location.address', { unique: false });
          }
        },
      });
      console.log('E-Complaint database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize e-complaint database:', error);
      throw error;
    }
  }

  async createComplaint(complaintData) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      // Get current user from localStorage or auth context
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const complaint = {
        ...complaintData,
        userId: currentUser.id || 'anonymous',
        userEmail: currentUser.email || 'anonymous@example.com',
        userName: currentUser.name || 'Anonymous User',
        status: 'pending', // pending, acknowledged, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        complaintNumber: this.generateComplaintNumber(),
        priority: this.calculatePriority(complaintData.complaintType),
        isRead: false,
        adminNotes: '',
        resolution: null,
        resolvedAt: null,
        assignedTo: null
      };

      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const result = await store.add(complaint);
      await tx.complete;

      console.log('E-Complaint created successfully:', result);
      return { id: result, ...complaint };
    } catch (error) {
      console.error('Failed to create e-complaint:', error);
      throw new Error(`Failed to create complaint: ${error.message}`);
    }
  }

  async getComplaintsByUser(userId) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('userId');
      const complaints = await index.getAll(userId);
      await tx.complete;

      // Sort by creation date (newest first)
      return complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get user complaints:', error);
      throw new Error(`Failed to retrieve complaints: ${error.message}`);
    }
  }

  async getAllComplaints() {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const complaints = await store.getAll();
      await tx.complete;

      // Sort by creation date (newest first)
      return complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get all complaints:', error);
      throw new Error(`Failed to retrieve all complaints: ${error.message}`);
    }
  }

  async getComplaintById(id) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const complaint = await store.get(id);
      await tx.complete;

      if (!complaint) {
        throw new Error('Complaint not found');
      }

      return complaint;
    } catch (error) {
      console.error('Failed to get complaint by ID:', error);
      throw new Error(`Failed to retrieve complaint: ${error.message}`);
    }
  }

  async updateComplaintStatus(id, status, adminNotes = '', assignedTo = null) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const complaint = await store.get(id);

      if (!complaint) {
        throw new Error('Complaint not found');
      }

      const updatedComplaint = {
        ...complaint,
        status,
        adminNotes,
        assignedTo,
        updatedAt: new Date().toISOString(),
        isRead: true,
        ...(status === 'resolved' && { resolvedAt: new Date().toISOString() })
      };

      await store.put(updatedComplaint);
      await tx.complete;

      console.log('Complaint status updated successfully');
      return updatedComplaint;
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      throw new Error(`Failed to update complaint: ${error.message}`);
    }
  }

  async deleteComplaint(id) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.delete(id);
      await tx.complete;

      console.log('Complaint deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      throw new Error(`Failed to delete complaint: ${error.message}`);
    }
  }

  async getComplaintsByStatus(status) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('status');
      const complaints = await index.getAll(status);
      await tx.complete;

      return complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get complaints by status:', error);
      throw new Error(`Failed to retrieve complaints by status: ${error.message}`);
    }
  }

  async getComplaintsByType(complaintType) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('complaintType');
      const complaints = await index.getAll(complaintType);
      await tx.complete;

      return complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get complaints by type:', error);
      throw new Error(`Failed to retrieve complaints by type: ${error.message}`);
    }
  }

  async getComplaintStats() {
    try {
      const allComplaints = await this.getAllComplaints();
      
      const stats = {
        total: allComplaints.length,
        pending: allComplaints.filter(c => c.status === 'pending').length,
        acknowledged: allComplaints.filter(c => c.status === 'acknowledged').length,
        resolved: allComplaints.filter(c => c.status === 'resolved').length,
        rejected: allComplaints.filter(c => c.status === 'rejected').length,
        byType: {},
        byMonth: {},
        averageResolutionTime: 0
      };

      // Group by complaint type
      allComplaints.forEach(complaint => {
        const type = complaint.complaintType || 'Other';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      // Group by month
      allComplaints.forEach(complaint => {
        const month = new Date(complaint.createdAt).toISOString().slice(0, 7); // YYYY-MM
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      });

      // Calculate average resolution time
      const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved' && c.resolvedAt);
      if (resolvedComplaints.length > 0) {
        const totalResolutionTime = resolvedComplaints.reduce((total, complaint) => {
          const created = new Date(complaint.createdAt);
          const resolved = new Date(complaint.resolvedAt);
          return total + (resolved - created);
        }, 0);
        stats.averageResolutionTime = Math.round(totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)); // days
      }

      return stats;
    } catch (error) {
      console.error('Failed to get complaint stats:', error);
      throw new Error(`Failed to retrieve complaint statistics: ${error.message}`);
    }
  }

  generateComplaintNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `EC-${timestamp.slice(-6)}-${random}`;
  }

  calculatePriority(complaintType) {
    const highPriorityTypes = [
      'Abuse To Service Recipients',
      'Misuse of authority',
      'Involved In Sexual Activity',
      'Seeking financial gain'
    ];
    
    const mediumPriorityTypes = [
      'Police Personnel\'s Grievances or Complaints',
      'Misuse Of Social Media By Police Personnel'
    ];

    if (highPriorityTypes.includes(complaintType)) {
      return 'high';
    } else if (mediumPriorityTypes.includes(complaintType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  async clearAllComplaints() {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.clear();
      await tx.complete;

      console.log('All complaints cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear complaints:', error);
      throw new Error(`Failed to clear complaints: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const eComplaintService = new EComplaintService();
export { eComplaintService };
