export default {
  name: 'projects',
  title: 'Projects',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'creator',
      title: 'Creator',
      type: 'reference',
      to: { type: 'users' },
      validation: (Rule) => Rule.required()
    },
    {
      name: 'avatarImage',
      title: 'Avatar image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'backgroundImage',
      title: 'Background image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text'
    },
    {
      name: 'targetAmount',
      title: 'Target amount',
      type: 'number'
    },
    {
      name: 'contributorsCount',
      title: 'Contributors count',
      type: 'number'
    },
    {
      name: 'sponsorsCount',
      title: 'Sponsors count',
      type: 'number'
    }
  ]
};
