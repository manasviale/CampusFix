import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let inMemoryDb = {
  users: [],
  tickets: [],
  upvotes: []
};

let fallbackActive = false;

export function isFallbackActive() {
  return fallbackActive;
}

export function setFallbackActive(active) {
  fallbackActive = active;
  if (active) {
    initLocalDb();
  }
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveDb() {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
}

export function initLocalDb() {
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(content);
      if (!inMemoryDb.users) inMemoryDb.users = [];
      if (!inMemoryDb.tickets) inMemoryDb.tickets = [];
      if (!inMemoryDb.upvotes) inMemoryDb.upvotes = [];
      return;
    } catch (e) {
      console.warn('Could not read existing db.json, creating new one...');
    }
  }

  // Pre-seed default users and tickets
  const salt = bcrypt.genSaltSync(10);
  
  const adminId = 'u_' + crypto.randomBytes(8).toString('hex');
  const facultyId = 'u_' + crypto.randomBytes(8).toString('hex');
  const volunteerId = 'u_' + crypto.randomBytes(8).toString('hex');
  const studentId = 'u_' + crypto.randomBytes(8).toString('hex');

  inMemoryDb.users = [
    {
      _id: adminId,
      name: 'Admin Officer',
      email: 'admin@bpitindia.edu.in',
      passwordHash: bcrypt.hashSync('admin123', salt),
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      _id: facultyId,
      name: 'Faculty Mentor',
      email: 'faculty@bpitindia.edu.in',
      passwordHash: bcrypt.hashSync('faculty123', salt),
      role: 'faculty',
      createdAt: new Date().toISOString()
    },
    {
      _id: volunteerId,
      name: 'Campus Volunteer',
      email: 'volunteer@bpitindia.edu.in',
      passwordHash: bcrypt.hashSync('volunteer123', salt),
      role: 'volunteer',
      createdAt: new Date().toISOString()
    },
    {
      _id: studentId,
      name: 'Student Member',
      email: 'student@bpitindia.edu.in',
      passwordHash: bcrypt.hashSync('student123', salt),
      role: 'student',
      createdAt: new Date().toISOString()
    }
  ];

  const t1Id = 't_' + crypto.randomBytes(8).toString('hex');
  const t2Id = 't_' + crypto.randomBytes(8).toString('hex');
  const t3Id = 't_' + crypto.randomBytes(8).toString('hex');
  const t4Id = 't_' + crypto.randomBytes(8).toString('hex');
  const t5Id = 't_' + crypto.randomBytes(8).toString('hex');

  inMemoryDb.tickets = [
    {
      _id: t1Id,
      title: 'Wi-Fi Disconnecting in Computer Lab B-204',
      description: 'The Wi-Fi in Computer Lab B-204 keeps disconnecting every 5 minutes. It is impossible to complete practical coding assignments. Please fix access points.',
      location: 'Lab Block B, Room 204',
      category: 'Internet',
      priority: 'High',
      department: 'IT Department',
      status: 'In Progress',
      upvoteCount: 14,
      createdBy: volunteerId,
      aiSummary: 'Frequent Wi-Fi connectivity drops disrupting student lab sessions in B-204.',
      aiSuggestedAction: 'Restart access point B-204 and check DHCP pool exhaustion.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      _id: t2Id,
      title: 'Water Cooler Leakage Near 2nd Floor Library',
      description: 'Continuous drinking water leakage from the dispenser near library entrance, causing slippery corridor.',
      location: 'Main Academic Building, 2nd Floor',
      category: 'Water',
      priority: 'Medium',
      department: 'Maintenance',
      status: 'Submitted',
      upvoteCount: 8,
      createdBy: volunteerId,
      aiSummary: 'Plumbing leak near high-traffic library corridor presenting slip hazard.',
      aiSuggestedAction: 'Turn off line valve and replace dispensing nozzle gasket.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      _id: t3Id,
      title: 'Projector Bulb Dead in Seminar Hall 1',
      description: 'Main ceiling projector bulb has fused before the upcoming department tech symposium.',
      location: 'Seminar Hall 1, Ground Floor',
      category: 'Infrastructure',
      priority: 'Urgent',
      department: 'Maintenance',
      status: 'In Review',
      upvoteCount: 19,
      createdBy: volunteerId,
      aiSummary: 'Fused projector bulb impeding scheduled presentations in main hall.',
      aiSuggestedAction: 'Replace 4000-lumen lamp module and test HDMI connection.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      _id: t4Id,
      title: 'Broken Bench in Room 301',
      description: 'Back support detached on the third row bench, screws are exposed.',
      location: 'Classroom Block, Room 301',
      category: 'Infrastructure',
      priority: 'Low',
      department: 'Maintenance',
      status: 'Resolved',
      upvoteCount: 4,
      createdBy: volunteerId,
      aiSummary: 'Damaged wooden bench with safety hazard in room 301.',
      aiSuggestedAction: 'Re-screw bracket and polish surface.',
      resolvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
    },
    {
      _id: t5Id,
      title: 'Street Light Flickering at Hostel Gate',
      description: 'Outdoor street lamp at the main hostel pathway flickers constantly and shuts down at midnight.',
      location: 'Hostel Gate Pathway',
      category: 'Security',
      priority: 'High',
      department: 'Electrical',
      status: 'Submitted',
      upvoteCount: 11,
      createdBy: volunteerId,
      aiSummary: 'Unreliable illumination on hostel walkway posing evening safety risk.',
      aiSuggestedAction: 'Check outdoor ballast and LED transformer.',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ];

  inMemoryDb.upvotes = [
    { _id: 'up_' + crypto.randomBytes(6).toString('hex'), user: studentId, ticket: t1Id },
    { _id: 'up_' + crypto.randomBytes(6).toString('hex'), user: studentId, ticket: t3Id }
  ];

  saveDb();
}

function wrapDoc(item, collectionName) {
  if (!item) return null;
  const clone = { ...item };
  clone.id = clone._id;
  clone.toJSON = function () {
    const res = { ...clone };
    delete res.passwordHash;
    delete res.__v;
    return res;
  };
  clone.save = async function () {
    const list = inMemoryDb[collectionName];
    const idx = list.findIndex(x => String(x._id) === String(clone._id));
    if (idx >= 0) {
      list[idx] = { ...clone };
      delete list[idx].save;
      delete list[idx].toJSON;
      delete list[idx].id;
    } else {
      const toSave = { ...clone };
      delete toSave.save;
      delete toSave.toJSON;
      delete toSave.id;
      list.push(toSave);
    }
    saveDb();
    return clone;
  };
  return clone;
}

export const LocalUser = {
  async findOne(query) {
    let users = inMemoryDb.users;
    if (query.email) {
      const email = String(query.email).trim().toLowerCase();
      const match = users.find(u => u.email.toLowerCase() === email);
      return wrapDoc(match, 'users');
    }
    return null;
  },

  async findById(id) {
    const match = inMemoryDb.users.find(u => String(u._id) === String(id));
    return wrapDoc(match, 'users');
  },

  find(filter = {}) {
    let list = inMemoryDb.users.slice();
    if (filter.role) {
      if (typeof filter.role === 'object' && filter.role.$in) {
        list = list.filter(u => filter.role.$in.includes(u.role));
      } else {
        list = list.filter(u => u.role === filter.role);
      }
    }
    if (filter.$or) {
      list = list.filter(u => {
        return filter.$or.some(c => {
          if (c.name) return new RegExp(c.name.$regex, c.name.$options).test(u.name);
          if (c.email) return new RegExp(c.email.$regex, c.email.$options).test(u.email);
          return false;
        });
      });
    }

    return {
      select() {
        return list.map(u => wrapDoc(u, 'users').toJSON());
      }
    };
  },

  async create(doc) {
    const newDoc = {
      _id: 'u_' + crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString(),
      ...doc
    };
    inMemoryDb.users.push(newDoc);
    saveDb();
    return wrapDoc(newDoc, 'users');
  },

  async deleteMany() {
    inMemoryDb.users = [];
    saveDb();
  },

  async countDocuments() {
    return inMemoryDb.users.length;
  }
};

export const LocalTicket = {
  find(filter = {}) {
    let list = inMemoryDb.tickets.slice();

    if (filter.$or) {
      list = list.filter(t => {
        return filter.$or.some(cond => {
          if (cond.title) return new RegExp(cond.title.$regex, cond.title.$options).test(t.title);
          if (cond.description) return new RegExp(cond.description.$regex, cond.description.$options).test(t.description);
          return false;
        });
      });
    }

    if (filter.category) list = list.filter(t => t.category === filter.category);
    if (filter.priority) list = list.filter(t => t.priority === filter.priority);
    if (filter.department) list = list.filter(t => t.department === filter.department);
    if (filter.status) {
      if (typeof filter.status === 'object' && filter.status.$ne) {
        list = list.filter(t => t.status !== filter.status.$ne);
      } else if (typeof filter.status === 'object' && Array.isArray(filter.status.$in)) {
        list = list.filter(t => filter.status.$in.includes(t.status));
      } else {
        list = list.filter(t => t.status === filter.status);
      }
    }

    let current = list;

    const queryObj = {
      populate(field, select) {
        current = current.map(t => {
          const author = inMemoryDb.users.find(u => String(u._id) === String(t.createdBy));
          return {
            ...t,
            createdBy: author ? { _id: author._id, name: author.name, email: author.email } : { name: 'Staff' }
          };
        });
        return queryObj;
      },
      sort(sortOptions) {
        if (sortOptions.createdAt === -1) {
          current.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortOptions.createdAt === 1) {
          current.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortOptions.upvoteCount === -1) {
          current.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
        }
        return queryObj;
      },
      skip(n) {
        current = current.slice(n);
        return queryObj;
      },
      limit(n) {
        current = current.slice(0, n);
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(current.map(t => wrapDoc(t, 'tickets'))).then(resolve, reject);
      }
    };

    return queryObj;
  },

  async countDocuments(filter = {}) {
    let list = inMemoryDb.tickets;
    if (filter.status && filter.status.$ne) {
      list = list.filter(t => t.status !== filter.status.$ne);
    }
    if (filter.category) list = list.filter(t => t.category === filter.category);
    if (filter.priority) list = list.filter(t => t.priority === filter.priority);
    return list.length;
  },

  findById(id) {
    const ticket = inMemoryDb.tickets.find(t => String(t._id) === String(id));
    const wrapped = wrapDoc(ticket, 'tickets');
    
    return {
      populate() {
        if (wrapped && wrapped.createdBy) {
          const author = inMemoryDb.users.find(u => String(u._id) === String(wrapped.createdBy));
          if (author) {
            wrapped.createdBy = { _id: author._id, name: author.name, email: author.email };
          }
        }
        return Promise.resolve(wrapped);
      },
      then(resolve, reject) {
        return Promise.resolve(wrapped).then(resolve, reject);
      }
    };
  },

  async findByIdAndUpdate(id, update) {
    const idx = inMemoryDb.tickets.findIndex(t => String(t._id) === String(id));
    if (idx < 0) return null;
    const item = inMemoryDb.tickets[idx];
    if (update.$inc) {
      for (const k in update.$inc) {
        item[k] = (item[k] || 0) + update.$inc[k];
      }
    }
    for (const k in update) {
      if (k !== '$inc') item[k] = update[k];
    }
    if (typeof item.upvoteCount === 'number') {
      item.upvoteCount = Math.max(0, item.upvoteCount);
    }
    saveDb();
    return wrapDoc(item, 'tickets');
  },

  async findByIdAndDelete(id) {
    const idx = inMemoryDb.tickets.findIndex(t => String(t._id) === String(id));
    if (idx < 0) return null;
    const removed = inMemoryDb.tickets.splice(idx, 1)[0];
    saveDb();
    return wrapDoc(removed, 'tickets');
  },

   createLocal(data = {}) {
    return wrapDoc({
      _id: 't_' + crypto.randomBytes(8).toString('hex'),
      upvoteCount: 0,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      ...data
    }, 'tickets');
  },
  async create(doc) {
    const wrapped = LocalTicket.createLocal(doc);
    await wrapped.save();
    return wrapped;
  },

  async insertMany(items) {
    const created = items.map(item => ({
      _id: 't_' + crypto.randomBytes(8).toString('hex'),
      upvoteCount: 0,
      createdAt: new Date().toISOString(),
      ...item
    }));
    inMemoryDb.tickets.push(...created);
    saveDb();
    return created.map(c => wrapDoc(c, 'tickets'));
  },

  async aggregate(pipeline) {
    // Pipeline group by field
    if (pipeline[0] && pipeline[0].$group) {
      const field = pipeline[0].$group._id.replace('$', '');
      const counts = {};
      inMemoryDb.tickets.forEach(t => {
        const val = t[field] || 'Other';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.keys(counts).map(k => ({ _id: k, count: counts[k] }));
    }
    return [];
  },

  async deleteMany() {
    inMemoryDb.tickets = [];
    saveDb();
  }
};

export const LocalUpvote = {
  async find(query = {}) {
    let list = inMemoryDb.upvotes.slice();
    if (query.user) {
      list = list.filter(u => String(u.user) === String(query.user));
    }
    if (query.ticket) {
      if (typeof query.ticket === 'object' && query.ticket.$in) {
        const set = new Set(query.ticket.$in.map(String));
        list = list.filter(u => set.has(String(u.ticket)));
      } else {
        list = list.filter(u => String(u.ticket) === String(query.ticket));
      }
    }
    return list.map(u => wrapDoc(u, 'upvotes'));
  },

  async findOne(query) {
    const match = inMemoryDb.upvotes.find(u => 
      String(u.user) === String(query.user) && String(u.ticket) === String(query.ticket)
    );
    return wrapDoc(match, 'upvotes');
  },

  async create(doc) {
    const newDoc = {
      _id: 'up_' + crypto.randomBytes(6).toString('hex'),
      ...doc
    };
    inMemoryDb.upvotes.push(newDoc);
    saveDb();
    return wrapDoc(newDoc, 'upvotes');
  },

  async findByIdAndDelete(id) {
    const idx = inMemoryDb.upvotes.findIndex(u => String(u._id) === String(id));
    if (idx >= 0) {
      inMemoryDb.upvotes.splice(idx, 1);
      saveDb();
    }
  },

  async deleteMany(filter) {
    if (filter && filter.ticket) {
      inMemoryDb.upvotes = inMemoryDb.upvotes.filter(u => String(u.ticket) !== String(filter.ticket));
      saveDb();
    } else {
      inMemoryDb.upvotes = [];
      saveDb();
    }
  }
};
