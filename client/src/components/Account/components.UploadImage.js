import React, { Component } from "react";

export default class UploadImage extends Component {
  render() {
    return (
      <>
        <h1>To Upload Image on mongoDB</h1>
        <hr />
        <div>
          <form action="/" method="POST" enctype="multipart/form-data">
            
          
            <div>
              <label for="image">Upload Image</label>
              <input type="file" id="image" name="image" value="" required />
            </div>
            <div>
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>

       
      </>
    );
  }
}
