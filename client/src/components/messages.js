import { format } from "timeago.js";

export default function Message( message ) {
  return (
    <div >
      <div >
        <img
         
          src="https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
          alt=""
        />
        <p >{message.text}</p>
      </div>
      <div >{format(message.createdAt)}</div>
    </div>
  );
}
{
 
}