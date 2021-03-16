import React, { Component } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import throttle from '../lib/throttle';

class Videos extends Component {
  constructor() {
    super();

    this.acceptedMimeTypes = ['video/mp4'];

    this.minSize = 1; // 1B
    this.maxSize = 524288000; // 500MB

    this.state = {
      videos: [],
      file: null,
      values: {
        title: '',
        description: '',
      },
      isLoading: false,
      isUploading: false,
      uploadProgess: 0,
    };
  }

  async componentDidMount() {
    const { context } = this.props;

    try {
      const response = await axios.get('/videos', {
        params: {
          user_id: context.user.id,
        },
      });
      this.setState({
        videos: response.data,
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
      return alert('File size must be less than 100MB.');
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
        isUploading: false,
        uploadProgess: 0,
        values: { title: '', description: '' },
      });
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

  upload = async () => {
    const { file, values } = this.state;

    if (!this.validate()) return;

    try {
      const {
        data: { video, url, params },
      } = await axios.post('/videos', {
        filename: file.name,
        ...values,
      });

      const form = new FormData();
      Object.keys(params).forEach(key => form.set(key, params[key]));
      form.set('x-amz-meta-tag', '');
      form.set('file', file);

      this.setState({ isUploading: true });

      await axios.post(url, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: false,
        onUploadProgress: throttle(this.handleUploadProgress, 400),
      });

      this.setState({
        videos: [...this.state.videos, video],
        file: null,
      });
    } catch (error) {
      console.log(error);
    }
  };

  handleUploadProgress = e => {
    this.setState({
      uploadProgess: Math.ceil(((e.loaded / e.total) * 100) / 10) * 10,
    });
  };

  deleteVideo = async e => {
    const videoId = +e.target.dataset.videoId;

    if (!window.confirm(`Are you sure you wish to delete video ${videoId}?`))
      return;

    try {
      await axios.delete(`/videos/${videoId}`);
      this.setState({
        videos: this.state.videos.filter(video => video.id !== videoId),
      });
    } catch (error) {
      alert(`Failed to delete video ${videoId}.`);
    }
  };

  render() {
    const {
      videos,
      file,
      values,
      isLoading,
      isUploading,
      uploadProgess,
    } = this.state;
    const { user } = this.props.context;

    return (
      <div className="section">
        <div className="container">
          <h1 className="title">{user.name}&apos;s videos</h1>

          <div>
            {isUploading && (
              <progress
                className="progress is-primary"
                value={uploadProgess}
                max="100"
              >
                {uploadProgess}%
              </progress>
            )}

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
            {videos.length < 1 && <div>No videos to show.</div>}

            {videos.length > 0 &&
              videos.map(video => {
                return (
                  <div key={video.id} className="card">
                    <div className="card-image">
                      <video width="320" height="240" controls>
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <div className="card-content">
                      <p className="title is-5">{video.title}</p>

                      <p>{video.description}</p>
                    </div>

                    <footer className="card-footer">
                      <p className="card-footer-item">
                        <span>
                          <a target="__blank" href={video.url}>
                            View full size
                          </a>
                        </span>
                      </p>
                      <p className="card-footer-item">
                        <span>
                          <a
                            role="button"
                            className="no-decor"
                            onClick={this.deleteVideo}
                            data-video-id={video.id}
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

export default Videos;
