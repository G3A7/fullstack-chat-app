import { useRef, useState } from "react";
import { usechatStore } from "../store/useChatStrore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

function MessageInput() {
  const [text, setText] = useState("");
  const [imgPreview, setImgPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessages } = usechatStore();
  const handleImageChange = (e) => {
    console.log("Image changed:", e.target.files);
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const removeImage = () => {
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imgPreview) {
      return;
    }
    try {
      await sendMessages({
        text: text.trim(),
        image: imgPreview,
      });
      setText("");
      setImgPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    }
  };
  return (
    <div className="p-4 w-full">
      {imgPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imgPreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imgPreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => {
              console.log(fileInputRef.current);
              fileInputRef.current.click();
            }}
          >
            <Image size={20} />
          </button>
          <button
            className="btn btn-sm btn-circle"
            type="submit"
            disabled={!text.trim() && !imgPreview}
          >
            <Send size={22} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
