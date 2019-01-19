# GroupMenu

## Filters

The FilteredMenu receives an array of configuration objects call filters
that enables the user to control the visibility of items within the menu.

### Basic Filter

A filter configuration object in it's simplest form is shown below:

```js
const filters = [
  {
    label: "Bookmarks",
    key: "bookmarks",
    icon: <BookmarkIcon style={{ color: "#ffffff" }} />
  }
];
```

The above fields have the following characteristics:

- **label** - the title of the filter visible to the user
- **icon** - the icon of the filter visible to the user
- **key** - the key used for filtering. The menu will use this key to evaluate a menu items status object.

The sample filter above will match every menu item that contain a `bookmarks` property with a truthy value.

### Complex Filter

Filters may introduce dependencies or evaluate against different forms of data.
For these a more complex filter configuration object is required.
See the example below:

```js
const filters = [
  {
    label: "Selected",
    key: "selections",
    disables: ["no-selections"],
    icon: <CheckIcon style={{ color: "#ffffff" }} />
  },
  {
    label: "No selection",
    id: "no-selections", // the default id is the key
    key: "selections",
    value: false, // the default value is true
    disables: ["selections"], // the default is []. this refers to the filter id
    icon: <BlockIcon />
  }
];
```

All of the fields from Basic Filters still apply.
The addtional fields have the following characteristics:

- **disables** - an array of filters `id`s that are disabled when this filter is active. This is useful when filtering against both forms of a boolean.
- **id** - uniquely identifies the filter. When not specified this will be filled in with the value of `key`. In this case we need to differentiate between the selected and not-selected filters since they both filter on the same key.
- **value** - the exact key value to match against. When not specified this defaults to true.

## Status Icons

The Menu receives an array of configuration objects that control how the status of menu items are displayed.
These may look similar in form too, but should not be confused with filter configurations as described above.

```js
const statusIcons = [
  {
    key: "bookmarks",
    //  value: true <-- optional field
    icon: <BookmarkIcon style={{ color: "#ffffff" }} />
  }
];
```

The above fields have the following characteristics:

- **key** - the key used to look up the menu item's status.
- **value** - the exact key value to match against. When not specified this defaults to true.
- **icon** - the icon to display on matching menu items.

The sample status icon above will display a bookmark icon on every menu item that contains a property "bookmarks" with a truthy value.

## Generating Menu Data

A utility has been provided that will process a group index and it's associated data to produce properly formatted menu data.

This example will generate menu entries where each group's progress is cacluated based on the truthy value of it's children's `selections` field:

```js
const menuEntries = generateMenuData(groupIndex, groupData, "selections");
```

By default the generated menu data will include `title` and `itemId` fields on each of the menu items.
In addition the `groupId` will be copied from the contextId and placed in the root of the object.

For example:
```js
const {bookId, chapter, verse} = item.contextId.reference;
const newItem = {
  ...item,
  groupId: item.contextId.groupId,
  itemId: `${bookId}${chapter}:${verse}`,
  title: `${bookId} ${chapter}:${verse}`
}
```

If you need to perform some custom processing on the menu items like localized titles, progress keys, or more granular itemId's
you can provide a callback as the last argument:

```js
const menuEntries = generateMenuData(
  groupIndex,
  groupData,
  "finished",
  item => {
    const {
      contextId: {
        reference: { bookId, chapter, verse }
      }
    } = item;
    return {
      ...item,
      title: `${bookId} ${chapter}:${verse}`,
      finished: Boolean(item.selections)
    };
  }
);
```

Where `item` may look something like this:

```js
const item = {
  "priority": 1,
  "comments": false,
  "reminders": false,
  "selections": [
    {
      "text": "Abraham",
      "occurrence": 1,
      "occurrences": 1
    }
  ],
  "verseEdits": false,
  "contextId": {
    "reference": {
      "bookId": "gal",
      "chapter": 3,
      "verse": 6
    },
    "tool": "translationWords",
    "groupId": "abraham",
    "quote": "á¼Î²ÏÎ±á½°Î¼",
    "strong": ["G00110"],
    "occurrence": 1
  },
  "invalidated": false,
  
  // these were automatically injected and may be overridden
  "groupId": "abraham",
  "itemId": "gal 6:3",
  "title": "gal 6:3"
}
```

> Note: The menu item callback is performed before the progress is calculated.
