export default {
  name: 'users',
  title: 'Users',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string'
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string'
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'string'
    },
    {
      name: 'avatarImage',
      title: 'Avatar image',
      type: 'image',
      options: {
        hotspot: true
      }
    }
  ]
};
