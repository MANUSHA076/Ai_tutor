export const subjects = ['All', 'Physics', 'CS', 'Math', 'Biology']

export const subjectFilters = [
  { id: 'All', label: 'All', tone: 'tone-all' },
  { id: 'Physics', label: 'Physics', tone: 'tone-physics' },
  { id: 'CS', label: 'CS', tone: 'tone-cs' },
  { id: 'Math', label: 'Math', tone: 'tone-math' },
  { id: 'Biology', label: 'Biology', tone: 'tone-bio' },
]

export const dateSortOptions = [
  { id: 'newest', label: 'Newest First', shortLabel: 'Newest' },
  { id: 'oldest', label: 'Oldest First', shortLabel: 'Oldest' },
]

export const lectures = [
  {
    id: 1,
    title: 'Introduction to Quantum Physics',
    subject: 'Physics',
    duration: '45:20',
    date: '2023-10-24',
    dateLabel: 'Oct 24, 2023',
    instructor: 'Dr. Einstein AI',
    instructorInitials: 'DE',
    thumbClass: 'thumb-physics',
  },
  {
    id: 2,
    title: 'Advanced React Hooks & Patterns',
    subject: 'CS',
    duration: '32:15',
    date: '2023-10-18',
    dateLabel: 'Oct 18, 2023',
    instructor: 'Prof. Code AI',
    instructorInitials: 'PC',
    thumbClass: 'thumb-cs',
  },
  {
    id: 3,
    title: 'Linear Algebra Fundamentals',
    subject: 'Math',
    duration: '58:40',
    date: '2023-10-12',
    dateLabel: 'Oct 12, 2023',
    instructor: 'Dr. Matrix AI',
    instructorInitials: 'DM',
    thumbClass: 'thumb-math',
  },
  {
    id: 4,
    title: 'Cell Biology & Genetics',
    subject: 'Biology',
    duration: '41:08',
    date: '2023-10-05',
    dateLabel: 'Oct 05, 2023',
    instructor: 'Dr. Helix AI',
    instructorInitials: 'DH',
    thumbClass: 'thumb-bio',
  },
  {
    id: 5,
    title: 'Thermodynamics & Heat Engines',
    subject: 'Physics',
    duration: '36:52',
    date: '2023-09-28',
    dateLabel: 'Sep 28, 2023',
    instructor: 'Dr. Einstein AI',
    instructorInitials: 'DE',
    thumbClass: 'thumb-physics',
  },
  {
    id: 6,
    title: 'Database Design Principles',
    subject: 'CS',
    duration: '29:44',
    date: '2023-09-20',
    dateLabel: 'Sep 20, 2023',
    instructor: 'Prof. Code AI',
    instructorInitials: 'PC',
    thumbClass: 'thumb-cs',
  },
]

export const subjectTagClass = {
  Physics: 'tag-physics',
  CS: 'tag-cs',
  Math: 'tag-math',
  Biology: 'tag-bio',
}
