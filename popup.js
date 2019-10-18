// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  
  const inputContext = document.getElementById("add-context"),
      inputSearch = document.getElementById("search-query"),
      contextList = document.getElementById("context-list");
  
  const contextWords = JSON.parse(window.localStorage.getItem("contextWords")) || {};

  const inputSearchCallBack = function(event) {

    if (event.keyCode != 13) return false;

    const createProperties = {
      url: 'https://www.google.co.in/search?q='+encodeURIComponent(this.value + ' '+ inputContext.value)
    };

    const searchContext = function() {
      if(contextWords[inputContext.value]) {
        contextWords[inputContext.value].count++; 
        window.localStorage.setItem("contextWords",JSON.stringify(contextWords)); 
      }
    };

    chrome.tabs.create(createProperties, searchContext);
  };

  const inputContextCallBack = function() {
    const count = contextWords[this.value] ? contextWords[this.value].count : 0;
    
    if(!contextWords[this.value]) {
      contextWords[this.value] = {
        count: count + 1,
        isSelected: true  
      };
      addItem(this.value); 
    }
     
    window.localStorage.setItem("contextWords", JSON.stringify(contextWords));
  };


  const constructListItems = function(contextWords) {
    for (const context in contextWords) {
      addItem(context);
    }
  };

  const addItem = function(context) {
    const listItem = document.createElement("li"),
          inputItem = document.createElement("input"),
          titleContent = document.createElement("span"),
          deleteIcon = document.createElement("i");

    inputItem.type = "checkbox";
    inputItem.checked = contextWords[context].isSelected;
    titleContent.innerHTML = context;
    
    listItem.appendChild(inputItem);
    listItem.appendChild(titleContent);
    listItem.appendChild(deleteIcon);
    contextList.appendChild(listItem);

    if(inputItem.checked) {
      inputContext.value += context + " "; 
    }
  };

  const clear = function(input){
    input.value = "";
  };

  contextList.onclick = function(event) {

    const e = event,
          target = e.target;

    if(target.nodeName === "INPUT") {
      if(target.checked) {
        inputContext.value += (" " + target.nextSibling.innerHTML);
        contextWords[target.nextSibling.innerHTML].isSelected = true;
        target.setAttribute("checked","checked"); 
      } else {
        inputContext.value = inputContext.value.replace(" " + target.nextSibling.innerHTML, "");
        contextWords[target.nextSibling.innerHTML].isSelected = false;
        target.removeAttribute("checked");
      }
      window.localStorage.setItem("contextWords", JSON.stringify(contextWords));  
    } else if(target.nodeName === "I") {
      target.parentNode.parentNode.removeChild(target.parentNode);
      delete contextWords[target.previousSibling.innerHTML];
      window.localStorage.setItem("contextWords", JSON.stringify(contextWords));
    } else {
      return
    }

  }

  inputSearch.addEventListener("keypress", inputSearchCallBack);

  inputContext.addEventListener("change", inputContextCallBack );

  constructListItems(contextWords);

});