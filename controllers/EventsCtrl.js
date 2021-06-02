//Events controller
const EventsCtrl = (function(){
  //event constructor
  const Event = function(id, title, description, link, categories, sources, geometries) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.link = link;
    this.categories = categories;
    this.sources = sources;
    this.geometries = geometries
  }

  //categorie constructor
  const Category = function(id, title) {
    this.id = id;
    this.title = title;
  }

  //data structure
  const data = {
    events: [],
    categories: []
  }

  return {
    //fetch events from NASA API and push each as new Event object to data structure
    setLocalData: async function() {
      //open http instance
      const http = new Http

      //fetch from API
      const api_data = await http.get('https://eonet.sci.gsfc.nasa.gov/api/v2.1/events')

      //wait for api call to finish and init events & cats for each item
      await api_data.events.forEach(event => {
        //init new event
        const newEvent = new Event(event.id, event.title, event.description, event.link, event.categories, event.sources, event.geometries)

        //find event categories
        newEvent.categories.forEach(category => {
          const newCategory = new Category(category.id, category.title)

          //check if category exists in data (= no dubplicates)
          //if not, push to category array
          if (!EventsCtrl.existsInArray(newCategory, data.categories)) {
            data.categories.push(newCategory)
          }
        })

        //push event to data
        data.events.push(newEvent)

      })

      await console.log(data.events);
      await console.log(data.categories)
    },
    //Return events from data structure
    getEvents: function() {
      return data.events
    },
    //Get event object by ID
    getEventById: function(id) {
      let foundEvent;
      data.events.forEach(event => {
        if (event.id == id) {
          foundEvent = event
        }
      })
      return foundEvent
    },
    //return categories from data structure
    getCategories: function() {
      return data.categories
    },
    //utility method - check if an object exists in an array. Returns boolean.
    existsInArray: function(object, array) {
      let i;
      for (i = 0; i < array.length; i++) {
        if(array[i].id === object.id) {
          return true
        }
      }
      return false
    }
  }
})()
