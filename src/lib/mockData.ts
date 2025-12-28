// Mock data for LittleSteps Daycare Portal

export type UserRole = 'admin' | 'teacher' | 'parent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  avatar?: string;
  classroomId: string;
  parentIds: string[];
  allergies: string[];
  medicalNotes?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Classroom {
  id: string;
  name: string;
  ageGroup: string;
  capacity: number;
  teacherId: string;
  studentCount: number;
}

export interface ActivityLog {
  id: string;
  childId: string;
  date: string;
  arrivalTime: string;
  pickupTime?: string;
  activities: string;
  mood: 'happy' | 'sad' | 'energetic' | 'tired' | 'calm';
  napDuration?: string;
  bathroomNotes?: string;
  generalNotes?: string;
  photos: string[];
  teacherId: string;
  status: 'draft' | 'published';
}

export interface MealLog {
  id: string;
  childId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  foodItems: string[];
  portionConsumed: 'none' | 'some' | 'most' | 'all';
  notes?: string;
  timestamp: string;
}

export interface WellbeingReport {
  id: string;
  childId: string;
  date: string;
  time: string;
  type: 'injury' | 'illness' | 'behavior' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionTaken: string;
  photos: string[];
  parentNotified: boolean;
  acknowledged: boolean;
  teacherId: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetAudience: 'my_classroom' | 'all_parents' | 'all_staff' | 'everyone';
  priority: 'low' | 'normal' | 'high';
  eventDate?: string;
  isPinned: boolean;
  createdAt: string;
  readBy: string[];
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  childId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Document {
  id: string;
  childId: string;
  name: string;
  type: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  dueDate?: string;
  submittedDate?: string;
  fileUrl?: string;
  notes?: string;
}

// Mock Users
export const mockUsers: User[] = [
  { id: 'admin-1', email: 'admin@littlesteps.com', name: 'Sarah Johnson', role: 'admin', phone: '(555) 123-4567' },
  { id: 'teacher-1', email: 'emily@littlesteps.com', name: 'Emily Chen', role: 'teacher', phone: '(555) 234-5678' },
  { id: 'teacher-2', email: 'michael@littlesteps.com', name: 'Michael Brown', role: 'teacher', phone: '(555) 345-6789' },
  { id: 'teacher-3', email: 'jessica@littlesteps.com', name: 'Jessica Williams', role: 'teacher', phone: '(555) 456-7890' },
  { id: 'parent-1', email: 'john.smith@email.com', name: 'John Smith', role: 'parent', phone: '(555) 567-8901' },
  { id: 'parent-2', email: 'mary.davis@email.com', name: 'Mary Davis', role: 'parent', phone: '(555) 678-9012' },
  { id: 'parent-3', email: 'robert.wilson@email.com', name: 'Robert Wilson', role: 'parent', phone: '(555) 789-0123' },
  { id: 'parent-4', email: 'linda.taylor@email.com', name: 'Linda Taylor', role: 'parent', phone: '(555) 890-1234' },
];

// Mock Classrooms
export const mockClassrooms: Classroom[] = [
  { id: 'class-1', name: 'Sunshine Room', ageGroup: '2-3 years', capacity: 12, teacherId: 'teacher-1', studentCount: 8 },
  { id: 'class-2', name: 'Rainbow Room', ageGroup: '3-4 years', capacity: 15, teacherId: 'teacher-2', studentCount: 11 },
  { id: 'class-3', name: 'Star Room', ageGroup: '4-5 years', capacity: 18, teacherId: 'teacher-3', studentCount: 14 },
];

// Mock Children
export const mockChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Emma Smith',
    age: 3,
    dateOfBirth: '2021-05-15',
    classroomId: 'class-1',
    parentIds: ['parent-1'],
    allergies: ['Peanuts'],
    medicalNotes: 'Carries EpiPen',
    emergencyContact: { name: 'Jane Smith', phone: '(555) 111-2222', relationship: 'Grandmother' }
  },
  {
    id: 'child-2',
    name: 'Liam Davis',
    age: 3,
    dateOfBirth: '2021-08-22',
    classroomId: 'class-1',
    parentIds: ['parent-2'],
    allergies: [],
    emergencyContact: { name: 'Tom Davis', phone: '(555) 222-3333', relationship: 'Uncle' }
  },
  {
    id: 'child-3',
    name: 'Olivia Wilson',
    age: 4,
    dateOfBirth: '2020-02-10',
    classroomId: 'class-2',
    parentIds: ['parent-3'],
    allergies: ['Dairy', 'Eggs'],
    medicalNotes: 'Lactose intolerant',
    emergencyContact: { name: 'Susan Wilson', phone: '(555) 333-4444', relationship: 'Aunt' }
  },
  {
    id: 'child-4',
    name: 'Noah Taylor',
    age: 4,
    dateOfBirth: '2020-11-05',
    classroomId: 'class-2',
    parentIds: ['parent-4'],
    allergies: [],
    emergencyContact: { name: 'Mark Taylor', phone: '(555) 444-5555', relationship: 'Grandfather' }
  },
  {
    id: 'child-5',
    name: 'Sophia Smith',
    age: 2,
    dateOfBirth: '2022-03-18',
    classroomId: 'class-1',
    parentIds: ['parent-1'],
    allergies: [],
    emergencyContact: { name: 'Jane Smith', phone: '(555) 111-2222', relationship: 'Grandmother' }
  },
  {
    id: 'child-6',
    name: 'Mason Brown',
    age: 3,
    dateOfBirth: '2021-07-30',
    classroomId: 'class-1',
    parentIds: ['parent-2'],
    allergies: ['Gluten'],
    emergencyContact: { name: 'Alice Brown', phone: '(555) 555-6666', relationship: 'Mother' }
  },
  {
    id: 'child-7',
    name: 'Ava Martinez',
    age: 4,
    dateOfBirth: '2020-09-12',
    classroomId: 'class-2',
    parentIds: ['parent-3'],
    allergies: [],
    emergencyContact: { name: 'Carlos Martinez', phone: '(555) 666-7777', relationship: 'Father' }
  },
  {
    id: 'child-8',
    name: 'Ethan Johnson',
    age: 5,
    dateOfBirth: '2019-12-25',
    classroomId: 'class-3',
    parentIds: ['parent-4'],
    allergies: ['Shellfish'],
    medicalNotes: 'Asthma - inhaler in bag',
    emergencyContact: { name: 'Grace Johnson', phone: '(555) 777-8888', relationship: 'Mother' }
  },
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    childId: 'child-1',
    date: '2024-12-28',
    arrivalTime: '08:30',
    pickupTime: '17:00',
    activities: 'Emma had a wonderful day! She participated in circle time, worked on a finger painting project, and played with building blocks. She loved the outdoor playtime and made friends with new classmates.',
    mood: 'happy',
    napDuration: '1.5 hours',
    bathroomNotes: 'Regular bathroom breaks, no issues',
    generalNotes: 'Emma shared her toys nicely today!',
    photos: [],
    teacherId: 'teacher-1',
    status: 'published'
  },
  {
    id: 'log-2',
    childId: 'child-2',
    date: '2024-12-28',
    arrivalTime: '09:00',
    activities: 'Liam enjoyed sensory play with sand and water. He practiced counting with colorful beads and participated in music time.',
    mood: 'energetic',
    napDuration: '2 hours',
    bathroomNotes: 'All good!',
    photos: [],
    teacherId: 'teacher-1',
    status: 'published'
  },
  {
    id: 'log-3',
    childId: 'child-3',
    date: '2024-12-28',
    arrivalTime: '08:00',
    pickupTime: '16:30',
    activities: 'Olivia worked on letter recognition today. She can now identify letters A-E! She also enjoyed story time and helped set up for snack.',
    mood: 'calm',
    napDuration: '1 hour',
    photos: [],
    teacherId: 'teacher-2',
    status: 'published'
  },
];

// Mock Meal Logs
export const mockMealLogs: MealLog[] = [
  { id: 'meal-1', childId: 'child-1', date: '2024-12-28', mealType: 'breakfast', foodItems: ['Oatmeal', 'Bananas', 'Milk'], portionConsumed: 'all', timestamp: '08:45' },
  { id: 'meal-2', childId: 'child-1', date: '2024-12-28', mealType: 'lunch', foodItems: ['Grilled Cheese', 'Tomato Soup', 'Apple Slices'], portionConsumed: 'most', notes: 'Didnt finish the soup', timestamp: '12:00' },
  { id: 'meal-3', childId: 'child-1', date: '2024-12-28', mealType: 'snack', foodItems: ['Crackers', 'Cheese', 'Grapes'], portionConsumed: 'all', timestamp: '15:00' },
  { id: 'meal-4', childId: 'child-2', date: '2024-12-28', mealType: 'breakfast', foodItems: ['Pancakes', 'Strawberries'], portionConsumed: 'some', notes: 'Not very hungry this morning', timestamp: '09:15' },
  { id: 'meal-5', childId: 'child-2', date: '2024-12-28', mealType: 'lunch', foodItems: ['Pasta', 'Vegetables', 'Bread'], portionConsumed: 'all', timestamp: '12:00' },
];

// Mock Wellbeing Reports
export const mockWellbeingReports: WellbeingReport[] = [
  {
    id: 'report-1',
    childId: 'child-1',
    date: '2024-12-27',
    time: '10:30',
    type: 'injury',
    description: 'Emma scraped her knee while playing on the playground.',
    severity: 'low',
    actionTaken: 'Cleaned the wound with antiseptic, applied a bandage, and gave a cold pack. She recovered quickly and continued playing.',
    photos: [],
    parentNotified: true,
    acknowledged: true,
    teacherId: 'teacher-1'
  },
  {
    id: 'report-2',
    childId: 'child-3',
    date: '2024-12-26',
    time: '14:00',
    type: 'illness',
    description: 'Olivia complained of a stomach ache after lunch.',
    severity: 'medium',
    actionTaken: 'Had her rest in a quiet area, monitored for an hour. Symptoms improved, but we recommend keeping an eye on her diet.',
    photos: [],
    parentNotified: true,
    acknowledged: false,
    teacherId: 'teacher-2'
  },
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Winter Holiday Schedule',
    content: 'Dear families, please note that LittleSteps will be closed from December 23rd to January 1st for the winter holidays. We will resume normal operations on January 2nd. Wishing everyone a joyful holiday season!',
    authorId: 'admin-1',
    targetAudience: 'everyone',
    priority: 'high',
    isPinned: true,
    createdAt: '2024-12-20',
    readBy: ['parent-1', 'parent-2']
  },
  {
    id: 'ann-2',
    title: 'Pajama Day - Friday!',
    content: 'Get ready for Pajama Day this Friday! Children can come to school in their favorite pajamas. We will have cozy activities planned including story time, movie watching, and hot cocoa (dairy-free options available).',
    authorId: 'teacher-1',
    targetAudience: 'my_classroom',
    priority: 'normal',
    eventDate: '2024-12-29',
    isPinned: false,
    createdAt: '2024-12-25',
    readBy: ['parent-1']
  },
  {
    id: 'ann-3',
    title: 'Photo Day Coming Up',
    content: 'Individual and class photos will be taken on January 10th. Please dress your child in picture-ready attire. Order forms will be sent home next week.',
    authorId: 'admin-1',
    targetAudience: 'all_parents',
    priority: 'normal',
    eventDate: '2025-01-10',
    isPinned: false,
    createdAt: '2024-12-22',
    readBy: []
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'parent-1',
    recipientId: 'teacher-1',
    childId: 'child-1',
    content: 'Hi Emily, just wanted to let you know Emma had trouble sleeping last night, so she might be a bit tired today.',
    timestamp: '2024-12-28T07:45:00',
    read: true
  },
  {
    id: 'msg-2',
    senderId: 'teacher-1',
    recipientId: 'parent-1',
    childId: 'child-1',
    content: 'Thanks for letting me know! Ill keep an eye on her and make sure she gets some extra rest during nap time if needed.',
    timestamp: '2024-12-28T08:15:00',
    read: true
  },
  {
    id: 'msg-3',
    senderId: 'parent-2',
    recipientId: 'teacher-1',
    childId: 'child-2',
    content: 'Will Liam need a change of clothes for the water play activity tomorrow?',
    timestamp: '2024-12-28T09:30:00',
    read: false
  },
];

// Mock Documents
export const mockDocuments: Document[] = [
  { id: 'doc-1', childId: 'child-1', name: 'Immunization Records', type: 'medical', status: 'approved', submittedDate: '2024-09-01' },
  { id: 'doc-2', childId: 'child-1', name: 'Emergency Contact Form', type: 'administrative', status: 'approved', submittedDate: '2024-09-01' },
  { id: 'doc-3', childId: 'child-1', name: 'Photo Release Form', type: 'consent', status: 'pending', dueDate: '2025-01-15' },
  { id: 'doc-4', childId: 'child-2', name: 'Immunization Records', type: 'medical', status: 'submitted', submittedDate: '2024-12-20' },
  { id: 'doc-5', childId: 'child-2', name: 'Allergy Information Form', type: 'medical', status: 'pending', dueDate: '2025-01-05' },
  { id: 'doc-6', childId: 'child-3', name: 'Annual Health Check', type: 'medical', status: 'expired', dueDate: '2024-12-01' },
];

// Helper functions
export const getUserById = (id: string) => mockUsers.find(u => u.id === id);
export const getChildById = (id: string) => mockChildren.find(c => c.id === id);
export const getClassroomById = (id: string) => mockClassrooms.find(c => c.id === id);
export const getChildrenByClassroom = (classroomId: string) => mockChildren.filter(c => c.classroomId === classroomId);
export const getChildrenByParent = (parentId: string) => mockChildren.filter(c => c.parentIds.includes(parentId));
export const getActivityLogsByChild = (childId: string) => mockActivityLogs.filter(l => l.childId === childId);
export const getMealLogsByChild = (childId: string) => mockMealLogs.filter(m => m.childId === childId);
export const getWellbeingReportsByChild = (childId: string) => mockWellbeingReports.filter(r => r.childId === childId);
export const getDocumentsByChild = (childId: string) => mockDocuments.filter(d => d.childId === childId);
