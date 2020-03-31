const tableWidth = 250;
const distance = 50;

export default {
  settings: {
    scale: 1,
    translate: {
      x: 0,
      y: 0
    }
  },
  tables: [
    {
      id: 1,
      name: 'books',
      settings: {
        width: 250
      },
      coordinates: {
        x: 0 * tableWidth + 100 + 0 * distance,
        y: 100
      },
      fields: [
        {
          fieldName: 'id',
          type: 'number',
          isPK: true
        },
        {
          fieldName: 'bookName',
          type: 'nvarchar'
        },
        {
          fieldName: 'categoryId',
          type: 'number',
          isFK: true,
          refToTable: 'categories'
        },
        {
          fieldName: 'authorId',
          type: 'number',
          isFK: true,
          refToTable: 'authors'
        }
      ]
    },
    {
      id: 2,
      name: 'categories',
      settings: {
        width: 250
      },
      coordinates: {
        x: 1 * tableWidth + 100 + 1 * distance,
        y: 100
      },
      fields: [
        {
          fieldName: 'id',
          type: 'number',
          isPK: true
        },
        {
          fieldName: 'categoryName',
          type: 'number'
        }
      ]
    },
    {
      id: 3,
      name: 'authors',
      settings: {
        width: 250
      },
      coordinates: {
        x: 2 * tableWidth + 100 + 2 * distance,
        y: 100
      },
      fields: [
        {
          fieldName: 'id',
          type: 'number',
          isPK: true
        },
        {
          fieldName: 'authorName',
          type: 'nvarchar'
        }
      ]
    }
  ],
  refs: [
    {
      id: 1,
      toId: 2,
      from: {
        fromField: 'books-categoryId'
        // isFK: true
      },
      to: {
        toField: 'categories-id'
        // isPK: true
      }
    },
    {
      id: 1,
      toId: 3,
      from: {
        fromField: 'books-authorId'
        // isFK: true
      },
      to: {
        toField: 'authors-id'
        // isPK: true
      }
    }
  ]
};
