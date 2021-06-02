//App module
const App = (function(EventsCtrl, UICtrl, MapCtrl){

  //Add all event listeners
  function addEventListeners() {
    //event for submit search
    document.querySelector(UISelectors.searchForm).addEventListener('submit', searchEvents)

    //event for search input
    document.querySelector(UISelectors.searchInput).addEventListener('input', searchInput)

    //set event listener on card-action to target dynamically added category buttons using event delegation
    document.querySelector(UISelectors.cardAction).addEventListener('click', filterEvents)

    //add event listener to itemList, target individual list items using event delegation
    document.querySelector(UISelectors.output).addEventListener('click', listClickEvent)

  }

  //Search events on submit
  function searchEvents(e) {

    e.preventDefault()

    const search = document.querySelector(UISelectors.searchInput).value.toLowerCase();

    const events = EventsCtrl.getEvents();

    let count = 0

    let foundCategories = []

    let foundEvents = []

    //iterate events
    events.forEach(event => {
      //check if search matches even title
      if (event.title.toLowerCase().indexOf(search) !== -1) {

        //show list item of matched event
        UICtrl.showListItem(event.id)

        //add event to foundEvents array, used by Map
        foundEvents.push(event)

        //check for categories: push unique categories to found categories array
        event.categories.forEach(category => {
          if (!EventsCtrl.existsInArray(category, foundCategories)) {
            foundCategories.push(category)
          }
        })

        //increase count by 1 for each event found
        count += 1
      } else {
      //if search doesnt match event title, check for category match
        event.categories.forEach(category => {
          if (category.title.toLowerCase().indexOf(search) === -1) {
            //no category match
            UICtrl.hideListItem(event.id)
          } else {
            //category match
            UICtrl.showListItem(event.id);

            //add event to foundEvents array, used by Map
            foundEvents.push(event)

            //check for categories of found events
            event.categories.forEach(category => {
              if (!EventsCtrl.existsInArray(category, foundCategories)) {
                foundCategories.push(category)
              }
            })

            //increase count by 1 for each event found
            count += 1
          }
        })
      }
    })

    //hide all category buttons
    EventsCtrl.getCategories().forEach(cat => {
      UICtrl.hideCategoryBtn(cat.id)
    })

    //show found category buttons
    foundCategories.forEach(cat => {
      UICtrl.showCategoryBtn(cat.id)
    })

    //reset map markers
    MapCtrl.resetFeatures(foundEvents)
    MapCtrl.resetMarkers()

    //set count of found events
    UICtrl.setEventsCount(count)

    //set all btn to inactive
    UICtrl.inactiveCategoryBtn('all')

  }

  //Filter events
  function filterEvents(e) {
    //event delegation - check if filter btn clicked
    if (e.target.classList.contains('filter-btn')) {
      const idFull = e.target.getAttribute('id');
      const id = parseInt(idFull.slice(11))

      //set category btns to inactive
      EventsCtrl.getCategories().forEach(cat => {
        UICtrl.inactiveCategoryBtn(cat.id)
      })

      //Set 'All' btn to inactive
      UICtrl.inactiveCategoryBtn('all')

      //Set selected category btn to active
      UICtrl.activeCategoryBtn(id)

      let shownEvents = []

      const events = EventsCtrl.getEvents()
      let count = 0

      //check category arrays for each event
      events.forEach(event => {
        event.categories.forEach(cat => {
          if (cat.id === id) {
            //Show event items that match category
            UICtrl.showListItem(event.id)

            //add to shown events array, used by Map
            shownEvents.push(event)
            count += 1
          } else {

            //hide event item if no match
            UICtrl.hideListItem(event.id)
          }
        })
      })

      //reset map markers
      MapCtrl.resetFeatures(shownEvents)
      MapCtrl.resetMarkers()


      UICtrl.setEventsCount(count)
    }
    //If not a filter btn, check if the All btn was clicked
    else if (e.target.classList.contains('all-btn')) {
      //clear filters & search
      EventsCtrl.getCategories().forEach(cat => {
        UICtrl.activeCategoryBtn(cat.id)
        UICtrl.showCategoryBtn(cat.id)
      })

      //set all events on map & list
      EventsCtrl.getEvents().forEach(event => {
        UICtrl.showListItem(event.id)
      })

      UICtrl.clearSearchField()

      UICtrl.activeCategoryBtn('all')

      MapCtrl.resetFeatures(EventsCtrl.getEvents())

      MapCtrl.resetMarkers()

      UICtrl.setEventsCount(EventsCtrl.getEvents().length)
    }

  }

  //Check if input is empty, then set all events
  function searchInput(e) {
    if (e.target.value === '') {
      EventsCtrl.getEvents().forEach(event => {
        UICtrl.showListItem(event.id)
      })
      EventsCtrl.getCategories().forEach(category => {
        UICtrl.showCategoryBtn(category.id)
        UICtrl.activeCategoryBtn(category.id)
      })
      UICtrl.activeCategoryBtn('all')
      UICtrl.setEventsCount(EventsCtrl.getEvents().length)

      MapCtrl.resetFeatures(EventsCtrl.getEvents())
      MapCtrl.resetMarkers()
    }
  }

  //handle list click event
  function listClickEvent(e) {
    e.preventDefault();

    let id;
    let itemClicked = false;

    //determine ID based on clicked item
    //set itemCliced to true if an item was clicked
    if(e.target.classList.contains('collection-item')) {
      id = e.target.id
      itemClicked = true;
    } else if (e.target.classList.contains('collection-item-text') || e.target.classList.contains('badge')) {
      itemClicked = true;
      id = e.target.parentElement.id
      console.log(id);
    }

    //check itemClicked
    if (itemClicked) {
      //remove active class of all list items
      const listItems = Array.from(document.querySelectorAll('.collection-item'))

      //look for clicked list item and add active class, remove from other list items.
      listItems.forEach(item => {
        item.classList.remove('active')
        if (item.id === id) {
          item.classList.add('active')
        }
      })

      const foundEvent = EventsCtrl.getEventById(id);

      MapCtrl.focusEvent(foundEvent)
    }
  }

  return {
    init: function() {
      console.log('App init....');

      //Fetch data, wait for promise to finish
      EventsCtrl.setLocalData()
      .then(() => {

        //add items to event list / add category buttons / set the count / init map
        UICtrl.populateEventsList(EventsCtrl.getEvents())
        UICtrl.addCategoryButtons(EventsCtrl.getCategories())
        UICtrl.setEventsCount(EventsCtrl.getEvents().length);
        MapCtrl.init(EventsCtrl.getEvents())

      })

      //add event listeners
      addEventListeners()

    }
  }
})(EventsCtrl, UICtrl, MapCtrl)

App.init()
