# Meal Planner - Google Sheets
## _Simple utility to help with meal planning and grocery shopping_

This is a simple utility to help with meal planning and grocery shopping.  It facilitates menu planning for the week, and organizes groceries based on where you would likely find them in the store.  The intention of this to to facilitate but not fully automate the creation of a grocery list - in every step, you can add/remove/adjust ingredients or tweak the output so that at the end you have what you need to walk the aisles (digital or IRL).

## Features
- Store ingredients for common dishes
- Configure grocery item categorization based on where you find things in your store
- Save history to create a time series of your meals

## Getting Started
Create a copy of this google sheet:
https://docs.google.com/spreadsheets/d/1UAr79M_9HRfsVFxehN5x4NenDk3oP2j9SZlnBzW2pgw/edit?usp=sharing

Ensure the app script copied over with it (look in "Extensions" -> "App Scripts", you should see a code.gs file with some javascript).  If not, copy over the code.gs file from this repo and save it there.

My normal workflow for using this is to:
1. Run "Save History" to record my previous week's meal history
2. Run both "Clear Ingredients" and "Clear List" to clean the state
2. Plan my meals for the week in the "Current Meals" tab
3. Run "Lookup Ingredients", and fill in any ingredients that are missing (usually because meals have not been previously defined)
4. Run "Compile" to generate the shopping list

## Details
In the "Meal Planning Automations" menu item you should see 5 options:
* __Lookup Ingredients__ - looks up the ingredients for the menu items planned on the "Current Meals" sheet, and if they are defined loads them into the cells below.
* __Compile__ - copies the ingredients over to the grocery list section, organized by where you might find them in the store.  Items that are unknown are mapped to an "Unknown" column.
* __Clear Ingredients__ - clears the ingredient list below the meals.
* __Clear List__ - clears the grocery list.
* __Save History__ - copies the "Current Meals" into the History tab, timestamped with the current date

There are also three important metadata tabs (highlighted in blue):
* __Ingredients__ - defines dishes and what goes into them
* __Ingredient Classifications__ - defines the mapping between ingredients and where they are in the grocery store
* __Staple Groceries__ - defines a list of groceries that should always be added to the grocery list

I stress, this is not a complete automation, merely a tool that facilitates the process of creating a weekly meal plan and shopping list.  It is purposefully course, and relies on you to manage common pantry items (e.g. it is not going to manage your spice or cooking oil rack).  But feel free to take it and customize as you like; it has helped me manage my weekly cooking for the past several years, and I hope it can help at least one other person do the same.
