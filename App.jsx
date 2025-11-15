import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Modal, CloseButton, Card } from 'react-bootstrap';
import './App.css';

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 24;

function App() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [likedPhotos, setLikedPhotos] = useState(new Set());
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const fetchImages = useCallback(async () => {
    try {
      if (searchInput.current.value) {
        setErrorMsg('');
        setLoading(true);
        const { data } = await axios.get(API_URL, {
          params: {
            query: searchInput.current.value,
            page,
            per_page: IMAGES_PER_PAGE,
            client_id: import.meta.env.VITE_API_KEY,
          },
        });
        setImages(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg('Error fetching images. Try again later.');
      console.log(error);
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (page === 1 && searchInput.current) {
      searchInput.current.value = 'galaxy';
    }
    fetchImages();
  }, [fetchImages, page]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (page === 1) {
      fetchImages();
    } else {
      setPage(1);
    }
  };

  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    if (page === 1) {
      fetchImages();
    } else {
      setPage(1);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const toggleLike = (photoId) => {
    setLikedPhotos((prevLikedPhotos) => {
      const newLikedPhotos = new Set(prevLikedPhotos);
      if (newLikedPhotos.has(photoId)) {
        newLikedPhotos.delete(photoId);
      } else {
        newLikedPhotos.add(photoId);
      }
      return newLikedPhotos;
    });
  };

  return (
    <div className='container'>
      <div className='title-container'>
        <h1 className='title'>Image Search</h1>
        <Button
          variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
          onClick={toggleTheme}
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </div>
      {errorMsg && <p className='error-msg'>{errorMsg}</p>}
      <div className='search-section'>
        <Form onSubmit={handleSearch}>
          <Form.Control
            type='search'
            placeholder='Type something to search...'
            className='search-input'
            ref={searchInput}
          />
        </Form>
      </div>
      <div className='filters'>
        <Button variant='secondary' onClick={() => handleSelection('nature')}>
          Nature
        </Button>
        <Button variant='secondary' onClick={() => handleSelection('birds')}>
          Birds
        </Button>
        <Button variant='secondary' onClick={() => handleSelection('cats')}>
          Cats
        </Button>
        <Button variant='secondary' onClick={() => handleSelection('car')}>
          car
        </Button>
      </div>
      {loading ? (
        <p className='loading'>Loading...</p>
      ) : (
        <>
          <div className='images'>
            {images.map((image) => (
              <Card key={image.id} className='image-card'>
                <Card.Img
                  variant='top'
                  src={image.urls.small}
                  alt={image.alt_description}
                  className='image'
                  onClick={() => handleImageClick(image)}
                />
                <Card.Footer className='card-footer-custom'>
                  <Button variant='outline-danger' size='sm' onClick={() => toggleLike(image.id)}>
                    {likedPhotos.has(image.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="bi bi-heart-fill" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-heart" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-1.113 2.175-.239 5.249 1.963 7.364L8 16l4.636-5.583c2.202-2.115 3.076-5.189 1.963-7.364C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                      </svg>
                    )}
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>
          <div className='buttons'>
            {page > 1 && (
              <Button variant='primary' onClick={() => setPage(page - 1)}>
                Previous
              </Button>
            )}
            {page < totalPages && (
              <Button variant='primary' onClick={() => setPage(page + 1)}>
                Next
              </Button>
            )}
          </div>
          <div>page value: {page}</div>
        </>
      )}
      {selectedImage && (
        <Modal show={showModal} onHide={handleCloseModal} centered size='lg'>
          <Modal.Header className='modal-header-custom'>
            <CloseButton
              onClick={handleCloseModal}
              variant={theme === 'dark' ? 'white' : undefined}
            />
            <Modal.Title>{selectedImage.user.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img
              src={selectedImage.urls.regular}
              alt={selectedImage.alt_description}
              className='modal-image'
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant='outline-danger' onClick={() => toggleLike(selectedImage.id)}>
              {likedPhotos.has(selectedImage.id) ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" className="bi bi-heart-fill" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-heart" viewBox="0 0 16 16">
                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-1.113 2.175-.239 5.249 1.963 7.364L8 16l4.636-5.583c2.202-2.115 3.076-5.189 1.963-7.364C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default App;