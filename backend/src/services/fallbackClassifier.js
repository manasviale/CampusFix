export function classifyComplaint(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  let category = 'Other';
  let department = 'Administration';
  let priority = 'Low';
  
  // Category & Department
  if (/(wifi|internet|network|connectivity)/.test(text)) {
    category = 'Internet';
    department = 'IT Department';
  } else if (/(electric|fan|light|switch|power)/.test(text)) {
    category = 'Electrical';
    department = 'Electrical';
  } else if (/(water|leak|plumbing|tap|pipe)/.test(text)) {
    category = 'Water';
    department = 'Maintenance';
  } else if (/(hostel|room|dormitory|bed)/.test(text)) {
    category = 'Hostel';
    department = 'Hostel Administration';
  } else if (/(security|theft|unauthorized|safety)/.test(text)) {
    category = 'Security';
    department = 'Security';
  } else if (/(clean|garbage|trash|waste|hygiene)/.test(text)) {
    category = 'Cleanliness';
    department = 'Housekeeping';
  } else if (/(library|book|reading)/.test(text)) {
    category = 'Library';
    department = 'Library';
  } else if (/(lab|laboratory|equipment|chemical)/.test(text)) {
    category = 'Laboratory';
    department = 'Administration';
  } else if (/(road|building|wall|door|window|gate|infrastructure|broken|damage)/.test(text)) {
    category = 'Infrastructure';
    department = 'Maintenance';
  }

  // Priority
  if (/(urgent|emergency|dangerous|critical)/.test(text)) {
    priority = 'Urgent';
  } else if (/(broken|not working|failed)/.test(text)) {
    priority = 'High';
  } else if (/(slow|intermittent|sometimes)/.test(text)) {
    priority = 'Medium';
  }

  return {
    category,
    priority,
    department,
    summary: 'Automated fallback summary based on keywords.',
    suggestedAction: `Assigned to ${department} for review.`
  };
}
