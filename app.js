//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ =  require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://AyushChamoli:eQQ76EcUZVQFV6xB@cluster0.hj0m1co.mongodb.net/todolistDB",{useNewurlParser:true})
const workItems = [];

const taskSchema = new mongoose.Schema({
  task: String
})

const Item = new mongoose.model("Item" , taskSchema)

const item1 = new Item({
  task : "Welcome to your TodoList!"
})

const defaultItems = [item1]

const listSchema = {
  name: String,
  items: [taskSchema]
}

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  Item.find(function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err){
        console.log(err)
        }
      else{
        console.log("inserted successfully")
      }
      })
    }
    else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  })
  })

app.post("/", function(req, res){

  const work = req.body.newItem
  const listName =  req.body.list
  const item = new Item({
    task: work
  })
  if(listName === 'Today'){
     item.save();
     res.redirect("/")
  }
  else{
    List.findOne({name:listName} , function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }
  })

app.get("/:customListName" , function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName} , function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect("/" + customListName)
      }
        
        else{
          res.render("list" , {listTitle:customListName , newListItems:foundlist.items})
        }
      }
    })
  })

app.post("/delete" , function(req,res){
  const checkItemId = req.body.checkbox
  const listName = req.body.list
  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId , function(err){
      if(err){
        throw(err)
      }
      else{
        console.log("deleted successfully");
      }
    })
    res.redirect("/")
  }
  else{
    List.findOneAndUpdate({name: listName} , {$pull:{items:{_id: checkItemId}}} , function(err,findItem){
      if(!err){
        res.redirect("/" + listName)
      }
    }) 
  }
  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
