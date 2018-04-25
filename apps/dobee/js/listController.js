var listItems;
var listObject = document.getElementById('mainList');

var cookieName = "todolistcookie";

//Is the user currently adding an item to the list?
var addingItem = false;

//How many little animated bees have spawned?
var beeCount = 0;

$(document).ready(function () {
    
    document.cookie = "";
    
    //Load existing todolist from cookie
    listItems = loadListFromCookie();
    
    //If there is no cookie, start from scratch
    if (listItems == null) {
        listItems = [];
    }
    
    //Otherwise, use the loaded array to generate a list
    else {
        var newList = [];
        for (i = 0; i < listItems.length; i++) {
            newList.push(addLoadedItemToList(listItems[i].title, listItems[i].desc, listItems[i].complete, i));
        }
    }
    
});


function addItemToList() {
    
    if (addingItem)
        return;
    else
        addingItem = true;
    
    var itemToAdd = document.createElement("DIV");
    
    itemToAdd.classList.add("listItem");
    
    var childBox = document.createElement("IMG");
    var childTitle = document.createElement("INPUT");
    var childDesc = document.createElement("INPUT");
    var childConfirm = document.createElement("BUTTON");
    
    childBox.classList.add("itemBox");
    childTitle.classList.add("itemTitle");
    childDesc.classList.add("itemDesc");
    childConfirm.classList.add("itemConfirm");
    
    childBox.setAttribute("src", "./images/ui_box.png");
    childConfirm.setAttribute("onclick", "confirmItem(this)");
    
    //Give the HTML element an ID so we can look it up in the array later
    itemToAdd.setAttribute("data-id", listItems.length);
    
    childTitle.placeholder = "What task?";
    childDesc.placeholder = "Description";
    
    
    itemToAdd.appendChild(childBox);
    itemToAdd.appendChild(childTitle);
    itemToAdd.appendChild(childDesc);
    itemToAdd.appendChild(childConfirm);
	
    listObject.appendChild(itemToAdd);
	
    
    //Make an object to represent the todolist item and give it a reference to the row
    
    
    var newItem = {
        title: "itemTitle",
        desc: "itemDesc",
        complete: false,
        element: itemToAdd
    };
    
    
    listItems.push(newItem);
    
    itemToAdd.style.height = "1px";
	setTimeout(function() { itemToAdd.style.height = "50px";}, 1)
    
    childTitle.focus();
}

function addLoadedItemToList(loadedTitle, loadedDesc, loadedComplete, arrayPosition) {
    
    var itemToAdd = document.createElement("DIV");
    
    itemToAdd.classList.add("listItem");
    
    var childBox = document.createElement("IMG");
    var childTitle = document.createElement("P");
    var childDesc = document.createElement("P");
    var childConfirm = document.createElement("BUTTON");
    
    childBox.classList.add("itemBox");
    childTitle.classList.add("itemTitle");
    childDesc.classList.add("itemDesc");
    childConfirm.classList.add("itemConfirm");
    
    if (!loadedComplete) {
        childBox.setAttribute("src", "./images/ui_box.png");
    } else {
        childBox.setAttribute("src", "./images/ui_boxTicked.png");
    }
	childBox.setAttribute("onclick", "tickItem(this.parentElement)");
    
    childConfirm.setAttribute("onclick", "deleteItem(this.parentElement)");
    
	childConfirm.style.background = "url(./images/ui_cross.png)";
	childConfirm.style.backgroundSize = "contain";
    
    childTitle.textContent = loadedTitle;
    childDesc.textContent = loadedDesc;
    
    //Give the HTML element an ID so we can look it up in the array later
    itemToAdd.setAttribute("data-id", arrayPosition);
    
    itemToAdd.appendChild(childBox);
    itemToAdd.appendChild(childTitle);
    itemToAdd.appendChild(childDesc);
    itemToAdd.appendChild(childConfirm);
	
    listObject.appendChild(itemToAdd);
	
    
    //Make an object to represent the todolist item and give it a reference to the row
    
    var newItem = {
        title: loadedTitle,
        desc: loadedDesc,
        complete: loadedComplete,
        element: itemToAdd
    };
    
    itemToAdd.style.height = "1px";
	setTimeout(function() { itemToAdd.style.height = "50px";}, 1)
    
    return newItem;
}

function tickItem(item) {
	
    var itemIndex = parseInt(item.getAttribute("data-id"));
    
    var isCompleteAlready = listItems[itemIndex].complete;
	
	if (isCompleteAlready) {
		
		//User has ticked a box that was already ticked. They probably want to revert it.
		
		console.log("untick");
		
		listItems[itemIndex].complete = false;
    	item.childNodes[0].src=('./images/ui_box.png');
    	saveListToCookie();
		
	}
	else {
		
		console.log("tick");
		
		listItems[itemIndex].complete = true;
		item.childNodes[0].src=('./images/ui_boxTicked.png');
		saveListToCookie();

		spawnBee();
	}
}

function confirmItem(item) {
	
    //User wants to confirm the creation of a new task.
    //Convert the input fields to text fields and change the confirm button to a delete button.
    
    addingItem = false;
    
    var holder = item.parentElement;
    
    var newTitle = document.createElement("P");
    var newDesc = document.createElement("P");
    
    newTitle.classList.add("itemTitle");
    newDesc.classList.add("itemDesc");
    
    newTitle.textContent = holder.children[1].value;
    newDesc.textContent = holder.children[2].value;
    
    holder.children[0].setAttribute("onclick", "tickItem(this.parentElement)");
    holder.children[1].replaceWith(newTitle);
    holder.children[2].replaceWith(newDesc);
    
    item.setAttribute("onclick", "deleteItem(this.parentElement)");
	item.style.background = "url(./images/ui_cross.png)";
	item.style.backgroundSize = "contain";
    
    //Now find the associated item in the array using the attribute we set earlier.
    //Apply the inputted text to the array item so it matches the corresponding DOM element.
    
    var arrayItem = listItems[parseInt(holder.getAttribute("data-id"))];
    arrayItem.title = newTitle.textContent;
    arrayItem.desc = newDesc.textContent;
    
	saveListToCookie();
    
    document.getElementById("button_AddItem").focus();
}

function deleteItem(item) {
    
    if (addingItem)
        return;
    
    var index = parseInt(item.getAttribute("data-id"));
    
	item.parentElement.removeChild(item);
	
    listItems.splice(index, 1);
    
    //For some reason we have to re-assign the HTML elements here - not sure when they're getting dropped but they are!
	
    for (i = 0; i < listItems.length; i++) {
        listItems[i].element = document.getElementsByClassName("listItem")[i];
    }
	
    //Shift all the IDs down by 1 to make up for the missing one.
	
    for (i = index; i < listItems.length; i++) {
        listItems[i].element.setAttribute("data-id", i);
    }

	saveListToCookie();
}

function loadListFromCookie() {
    
    var savedList = null;
    
    savedList = getCookie('todo');
    
    if (savedList != null) {
        savedList = JSON.parse(savedList);        
    
        for (i = 0; i < savedList.length; i++) {
            var element = savedList[i];
            element.title = savedList[i].title;
            element.desc = savedList[i].desc;
        }
    
    }
	return savedList;
}

function saveListToCookie() {
	
    var json_str = JSON.stringify(listItems);
    createCookie('todo', json_str, 7);
}

function createCookie(cookieName, cookieData, daysToLast) {
    
    var expires;
    if (daysToLast) {
        var date = new Date();
        date.setTime(date.getTime() + (daysToLast * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = cookieName + "=" + cookieData + expires + "; path=/";
}

function getCookie(cookieName) {
    
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(cookieName + "=");
        if (c_start != -1) {
            c_start = c_start + cookieName.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    
    return null;
}

function clearCookie() {
    listItems = [];
    saveListToCookie();
}

function spawnBee() {
    
    //Give the bee an ID so we can have multiple bees flying at once.
    beeCount++;
    var beeID = beeCount;
    
    var beeElement = document.createElement("IMG");
    beeElement.innerHTML = "<img />";
    beeElement.src = "images/bee.png";
    beeElement.classList.add("animated");
    beeElement.classList.add("pixelatedImage");
    beeElement.id = "beeSpawn" + beeID;
    
    var modifier = Math.round(Math.random() * 20);
    
    beeElement.style.top = "" + 5 + modifier + "px";
    beeElement.style.width = "32px";
    beeElement.style.height = "32px";
    beeElement.style.right = "-100px";
    
    $("#mainList").prepend(beeElement);
    
    var width = "+=" + $(document).width();
    
    $("#beeSpawn" + beeID).animate({right: width}, 2000, "linear", function() {beeElement.parentNode.removeChild(beeElement);});
}
