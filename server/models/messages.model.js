const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messagesSchema = new Schema(
  {    
    _id:{type:String, required:true},
    messageHistory:{type:Array, required:false}
  },
  {
    timestamps: true,
  }
);

const newMessage = mongoose.model("messages", messagesSchema);

module.exports = newMessage;
