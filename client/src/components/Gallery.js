import React, { Component } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';

class Gallery extends Component {
  constructor() {
    super();

    this.acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    this.minSize = 1; // 1B
    this.maxSize = 10485760; // 10MB

    this.state = {
      images: [],
      file: null,
      values: {
        title: '',
        description: '',
      },
      isLoading: false,
    };
  }

  async componentDidMount() {
    const { context } = this.props;

    try {
      const response = await axios.get('/gallery', {
        params: {
          user_id: context.user.id,
        },
      });
      this.setState({
        images: response.data,
      });
    } catch (error) {}
  }

  handleDropAccepted = files => {
    this.setState({ file: files[0] });
  };

  handleDropRejected = ([file]) => {
    if (!this.acceptedMimeTypes.includes(file.type)) {
      return alert('File type not allowed.');
    }

    if (file.size > this.maxSize) {
      return alert('File size must be less than 10MB.');
    }

    if (file.size < this.minSize) {
      return alert('File size must be greater than 0B.');
    }

    return 'File not allowed.';
  };

  updateValue = e => {
    this.setState({
      values: { ...this.state.values, [e.target.name]: e.target.value },
    });
  };

  submit = async () => {
    this.setState({ isLoading: true });

    try {
      await this.upload();
    } finally {
      this.setState({
        isLoading: false,
        values: { title: '', description: '' },
      });
    }
  };

  upload = async () => {
    const { file, values } = this.state;

    if (!this.validate()) return;

    try {
      const {
        data: { image, url, params },
      } = await axios.post('/gallery', {
        filename: file.name,
        ...values,
      });

      const form = new FormData();
      Object.keys(params).forEach(key => form.set(key, params[key]));
      form.set('x-amz-meta-tag', '');
      form.set('file', file);

      await axios.post(url, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: false,
      });

      this.setState({
        images: [...this.state.images, image],
        file: null,
      });
    } catch (error) {
      console.log(error);
    }
  };

  validate = () => {
    const { file, values } = this.state;

    if (!file) {
      alert('Must select a file.');
      return false;
    }

    if (!values.title.trim()) {
      alert('Must provide a title.');
      return false;
    }

    if (!values.description.trim()) {
      alert('Must provide a description.');
      return false;
    }

    return true;
  };

  deleteImage = async e => {
    const imageId = +e.target.dataset.imageId;

    if (!window.confirm(`Are you sure you wish to delete image ${imageId}?`))
      return;

    try {
      await axios.delete(`/gallery/${imageId}`);
      this.setState({
        images: this.state.images.filter(image => image.id !== imageId),
      });
    } catch (error) {
      alert(`Failed to delete image ${imageId}.`);
    }
  };

  render() {
    const { images, file, values, isLoading } = this.state;
    const { user } = this.props.context;

    return (
      <div className="section">
        <div className="container">
          <h1 className="title">{user.name}&apos;s gallery</h1>

          <div>
            <Dropzone
              accept={this.acceptedMimeTypes}
              multiple={false}
              minSize={this.minSize}
              maxSize={this.maxSize}
              onDropAccepted={this.handleDropAccepted}
              onDropRejected={this.handleDropRejected}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className: 'dropzone' })}>
                  <input {...getInputProps()} />
                  <span>
                    <i className="fas fa-upload"></i>
                  </span>
                  <p>
                    {file ? file.name : 'Drop file here, or click to select'}
                  </p>
                </div>
              )}
            </Dropzone>

            {file && (
              <div style={{ marginTop: '10px' }}>
                <div className="field">
                  <label className="label">Title</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={values.title}
                      onChange={this.updateValue}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Description</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="description"
                      placeholder="Description"
                      value={values.description}
                      onChange={this.updateValue}
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="control">
                    <button
                      className={
                        'button is-primary is-fullwidth' +
                        (isLoading ? ' is-loading' : '')
                      }
                      onClick={this.submit}
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="gallery">
            {images.length < 1 && <div>No images to show.</div>}

            {images.length > 0 &&
              images.map(image => {
                return (
                  <div key={image.id} className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src={image.url} alt={image.name} />
                      </figure>
                    </div>

                    <div className="card-content">
                      <p className="title is-5">{image.title}</p>

                      <p>{image.description}</p>
                    </div>

                    <footer className="card-footer">
                      <p className="card-footer-item">
                        <span>
                          <a target="__blank" href={image.url}>
                            View full size
                          </a>
                        </span>
                      </p>
                      <p className="card-footer-item">
                        <span>
                          <a
                            role="button"
                            className="no-decor"
                            onClick={this.deleteImage}
                            data-image-id={image.id}
                          >
                            Delete
                          </a>
                        </span>
                      </p>
                    </footer>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

export default Gallery;
