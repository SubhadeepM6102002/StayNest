```ejs
<% layout("/layout/boilerplate") %>

<div class="row">
  <div class="col-8 offset-2">

    <br>

    <h3>Create a New Listing</h3>

    <form
      method="POST"
      action="/listings"
      novalidate
      class="needs-validation"
    >

      <!-- Title -->
      <div class="mb-3">
        <label for="title" class="form-label">Title</label>

        <input
          id="title"
          name="listing[title]"
          placeholder="Enter title"
          type="text"
          class="form-control"
          required
        />

        <div class="valid-feedback">
          Title looks good!
        </div>

        <div class="invalid-feedback">
          Please enter a title.
        </div>
      </div>


      <!-- Description -->
      <div class="mb-3">
        <label for="description" class="form-label">
          Description
        </label>

        <textarea
          id="description"
          name="listing[description]"
          placeholder="Enter description"
          class="form-control"
          required
        ></textarea>

        <div class="invalid-feedback">
          Please enter a short description.
        </div>
      </div>


      <!-- Image URL -->
      <div class="mb-3">
        <label for="image" class="form-label">
          Image Link
        </label>

        <input
          id="image"
          name="listing[image]"
          placeholder="Paste image URL"
          type="text"
          class="form-control"
        />

        <div class="form-text">
          Paste the direct URL of the image.
        </div>
      </div>


      <!-- Price + Country -->
      <div class="row">

        <!-- Price -->
        <div class="mb-3 col-md-4">
          <label for="price" class="form-label">
            Price
          </label>

          <input
            id="price"
            type="number"
            name="listing[price]"
            placeholder="Enter price"
            class="form-control"
            required
            min="0"
          />

          <div class="invalid-feedback">
            Please enter a valid price.
          </div>
        </div>


        <!-- Country -->
        <div class="mb-3 col-md-8">
          <label for="country" class="form-label">
            Country
          </label>

          <input
            id="country"
            name="listing[country]"
            placeholder="India"
            type="text"
            class="form-control"
            required
          />

          <div class="invalid-feedback">
            Please enter a country name.
          </div>
        </div>

      </div>


      <!-- Location -->
      <div class="mb-3">
        <label for="location" class="form-label">
          Location
        </label>

        <input
          id="location"
          name="listing[location]"
          placeholder="West Bengal"
          type="text"
          class="form-control"
          required
        />

        <div class="invalid-feedback">
          Please enter a location.
        </div>
      </div>


      <br>

      <!-- Submit -->
      <button type="submit" class="btn btn-dark add_btn">
        Add
      </button>

    </form>

  </div>
</div>
```;
