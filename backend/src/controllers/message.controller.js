import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../libs/cloudinary.js";
import { getReceiverSocketId, io } from "../libs/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUserForSidebar  Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receivedId: userToChatId },
        { senderId: userToChatId, receivedId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const senMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receivedId } = req.params;
    const senderId = req.user._id;
    let imgUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imgUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receivedId,
      text,
      image: imgUrl,
    });
    await newMessage.save();
    // Real Time ...
    const receiverSocketId = getReceiverSocketId(receivedId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
