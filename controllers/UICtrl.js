//UI controller
const UICtrl = (function(){

  UISelectors = {
    output: '#eventsList',
    searchInput: "#eventSearch",
    searchForm: '.search-form',
    eventCount: '#event-count',
    cardAction: '.card-action',
    listItem: '.collection-item'
  }

  function getCategoryColor(category) {
    let color;

    /* set color variable based on category */
    if (category.title.toLowerCase() === 'severe storms') {
      color = 'pink'
    } else if (category.title.toLowerCase() === 'wildfires') {
      color = 'red'
    } else if (category.title.toLowerCase() === 'sea and lake ice') {
      color = 'cyan'
    } else if (category.title.toLowerCase() === 'volcanoes') {
      color = 'orange'
    } else {
      color = 'indigo'
    }

    return color
  }

  return {
    //Build UI elements for each event and add to DOM
    populateEventsList: function(events) {
      events.forEach(event => {
        const category = event.categories[0]

        //Create li Node
        const li = document.createElement('li')
        //Set li class
        li.className = 'collection-item ' + getCategoryColor(category)
        // set id
        li.id = event.id

        //create textNode
        const textSpan = document.createElement('span')

        //set span class
        textSpan.className = 'truncate collection-item-text'

        //set text content
        textSpan.textContent = event.title

        //append to li
        li.appendChild(textSpan)

        event.categories.forEach(category => {
          //create span
          const span = document.createElement('span')

          //set span class
          span.className = 'badge'

          //set text content
          span.textContent = category.title

          //append to li
          li.appendChild(span)
        })

        //append list item to ul
        document.querySelector(UISelectors.output).appendChild(li)
      })
    },
    //create category filter buttons based on data
    addCategoryButtons: function(categories) {
      let html = '<button id="filter-cat-all" class="btn all-btn indigo">All</button>'
      categories.forEach(category => {
        const color = getCategoryColor(category)

        html += `<button id="filter-cat-${category.id}" type="button" class="filter-btn btn ${color}" name="button">${category.title}</button>`
      })

      document.querySelector(UISelectors.cardAction).innerHTML = html
    },
    //Show list item based on id
    showListItem: function(id) {
      document.querySelector(`#${id}`).style.display = 'flex'
    },
    //Hide list item based on id
    hideListItem: function(id) {
      document.querySelector(`#${id}`).style.display = 'none'
    },
    //show category button based on id
    showCategoryBtn: function(id) {
      document.querySelector(`#filter-cat-${id}`).style.display = "inline"
    },
    //hide category button based on id
    hideCategoryBtn: function(id) {
      document.querySelector(`#filter-cat-${id}`).style.display = "none"
    },
    //lighten category btn
    inactiveCategoryBtn: function(id) {
      document.querySelector(`#filter-cat-${id}`).classList.add('lighten-3')
    },
    activeCategoryBtn: function(id) {
      document.querySelector(`#filter-cat-${id}`).classList.remove('lighten-3')
    },
    //Set total found event counter
    setEventsCount: function(count) {
      document.querySelector(UISelectors.eventCount).textContent = count
    },
    //clear text field
    clearSearchField: function() {
      document.querySelector(UISelectors.searchInput).value = ''
    },
    //set List item to active
    setActiveListItem: function(id) {
      const listItems = Array.from(document.querySelectorAll(UISelectors.listItem))
      console.log("active: " + id);

      listItems.forEach(item => {
        item.classList.remove('active')
        if (item.id === id) {
          item.classList.add('active')
          document.querySelector(UISelectors.output).scrollTo(0, item.offsetTop - 100)

        }
      })
    }
  }
})()
