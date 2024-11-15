import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nolesson from "../../Assets/Images/no-lesson-illustration.svg";
import Trash from "../../Assets/Images/trash.png";
import EditImg from "../../Assets/Images/edit.png";
import NewLesson from "./NewLesson";
import { addnewCourse } from "../../../api/baseApi";
import { convertToCourseFormData } from "../../../hooks/newCourseFunctions";

const NewCourse = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [popupOpen, setPopupOpen] = useState({ open: false, data: null });
  const [currentOverview, setCurrentOverview] = useState({
    heading: "",
    content: "",
    updateIndex: null,
  });

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: null,
    overviewPoints: [],
    lessons: [],
  });

  useEffect(() => {
    if (popupOpen.open) window.scrollTo(0, 0);
  }, [popupOpen]);

  const validateCourse = () => {
    if (!courseData.title.trim()) return "Course title is required";
    if (!courseData.description.trim()) return "Course description is required";
    const numericPrice = parseFloat(courseData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) return "Valid price is required";
    if (courseData.lessons.length === 0) return "At least one lesson is required";
    return null;
  };

  const handledirectInput = (type, value) => {
    setError(null);
    if (type === "price") {
      // Ensure price is stored as a number
      const numericValue = parseFloat(value);
      setCourseData({ ...courseData, [type]: isNaN(numericValue) ? "" : numericValue });
    } else {
      setCourseData({ ...courseData, [type]: value });
    }
  };

  const handleOverviewInput = (type, value) => {
    setError(null);
    setCurrentOverview({ ...currentOverview, [type]: value });
  };

  const addNewOverview = () => {
    if (currentOverview.heading && currentOverview.content) {
      const newOverview = [...courseData.overviewPoints];
      if (currentOverview.updateIndex === null) {
        newOverview.push({
          heading: currentOverview.heading,
          content: currentOverview.content,
          updateIndex: newOverview.length > 0 ? newOverview.length : 0,
        });
      } else {
        newOverview[currentOverview.updateIndex] = {
          heading: currentOverview.heading,
          content: currentOverview.content,
          updateIndex: currentOverview.updateIndex,
        };
      }
      setCourseData({ ...courseData, overviewPoints: newOverview });
      setCurrentOverview({
        heading: "",
        content: "",
        updateIndex: null,
      });
    }
  };

  const handleRemoveOverview = (index) => {
    const newOverviews = [...courseData.overviewPoints];
    newOverviews.splice(index, 1);
    const updatedOverviews = newOverviews.map((overview, idx) => ({
      ...overview,
      updateIndex: idx,
    }));
    setCourseData({ ...courseData, overviewPoints: updatedOverviews });
  };

  const setEditValues = (overview, index) => {
    setCurrentOverview({
      heading: overview.heading,
      content: overview.content,
      updateIndex: index,
    });
  };

  const addLessontoCourse = (lesson) => {
    const newLessons = [...courseData.lessons];
    if (lesson.updateIndex === null) {
      newLessons.push({
        ...lesson,
        updateIndex: newLessons.length > 0 ? newLessons.length : 0,
      });
    } else {
      newLessons[lesson.updateIndex] = lesson;
    }
    setCourseData({ ...courseData, lessons: newLessons });
    setPopupOpen({ open: false, data: null });
  };

  const removeLessonFromCourse = (lesson) => {
    const newLessons = [...courseData.lessons];
    newLessons.splice(lesson.updateIndex, 1);
    const updatedLessons = newLessons.map((lesson, idx) => ({
      ...lesson,
      updateIndex: idx,
    }));
    setCourseData({ ...courseData, lessons: updatedLessons });
    setPopupOpen({ open: false, data: null });
  };

  const uploadCourse = async () => {
    try {
      setError(null);
      setIsLoading(true);
  
      const validationError = validateCourse();
      if (validationError) {
        setError(validationError);
        return;
      }
  
      const courseFormData = convertToCourseFormData(courseData);
      const response = await addnewCourse(courseFormData);
  
      console.log(response); // Log the full response object
      console.log(response.data); // Log just the data part
  
      // Update this condition to check for newCourse instead of course
      if (response.data?.newCourse) {
        navigate('/admin');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Error creating course:", error.response?.data || error.message);
      setError(
        error.response?.data?.details || 
        error.response?.data?.message || 
        error.message || 
        'Failed to create course. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div
      className="course-list-cnt new-course"
      style={{
        overflow: popupOpen.open ? "hidden" : "scroll",
      }}
    >
      <div className="top-header-cnt">
        <div>
          <h3 className="course-new-title">Create New Course</h3>
          <p className="course-new-discription">
            Create new course and lets publish
          </p>
        </div>
        
        {error && (
          <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}
        
        <div className="top-btn-cnt">
          <div className="course-delete-btn" onClick={() => navigate("/admin")}>
            Cancel
          </div>
          <button 
            className="add-new-lesson-btn" 
            onClick={uploadCourse}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Course"}
          </button>
        </div>
      </div>

      <div className="input-split-cover">
        <form className="left-form">
          <div className="course-name-cnt">
            <p>Enter course Name</p>
            <input
              type="text"
              className="name-input"
              value={courseData.title}
              onChange={(e) => handledirectInput("title", e.target.value)}
              placeholder="Course Title"
            />
          </div>

          <div className="course-description-cnt">
            <p>Describe course</p>
            <textarea
              className="description-input"
              value={courseData.description}
              onChange={(e) => handledirectInput("description", e.target.value)}
              placeholder="Course Description"
            />
          </div>

          <div className="flex-input">
            <div className="course-name-cnt">
              <p>Enter course price</p>
              <input
                type="number"
                className="name-input price-input"
                value={courseData.price || ""}
                placeholder="₹"
                onChange={(e) => handledirectInput("price", e.target.value)}
              />
            </div>
            <div className="course-name-cnt">
              <p>Upload course thumbnail</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseData({...courseData, thumbnail: e.target.files[0]})}
                className="styled-input"
              />
            </div>
          </div>

          <div className="course-description-cnt">
            <p>Overview Points</p>
            <div className="overview-input-cnt">
              <input
                type="text"
                className="name-input"
                value={currentOverview.heading}
                placeholder="Heading"
                onChange={(e) => handleOverviewInput("heading", e.target.value)}
              />
              <textarea
                className="overview-input name-input"
                placeholder="Description"
                value={currentOverview.content}
                onChange={(e) => handleOverviewInput("content", e.target.value)}
              />
              <div className="overview-add-btn" onClick={addNewOverview}>
                <p>Add</p>
              </div>
            </div>

            {courseData.overviewPoints.map((overview, index) => (
              <div className="overviewPoint-cnt" key={index}>
                <div className="overview-head-cnt">
                  <p className="overviewPoint-heading">{overview.heading}</p>
                  <div className="action-btn-cnt-overview">
                    <img
                      src={Trash}
                      alt="delete"
                      className="action-img-overview"
                      onClick={() => handleRemoveOverview(index)}
                    />
                    <img
                      src={EditImg}
                      alt="edit"
                      className="action-img-overview"
                      onClick={() => setEditValues(overview, index)}
                    />
                  </div>
                </div>
                <p className="overviewPoint-content">{overview.content}</p>
              </div>
            ))}
          </div>
        </form>

        <form className="form-right">
          <div className="form-right-header">
            <h3 className="course-new-title form-right-heading">
              List The Lessons
            </h3>
            <div
              className="add-new-lesson-btn"
              onClick={() => setPopupOpen({ open: true, data: null })}
            >
              Add new lesson
            </div>
          </div>

          <div className="lesson-list-cnt">
            {courseData.lessons.length > 0 ? (
              courseData.lessons.map((lesson, index) => (
                <div
                  key={index}
                  className="lesson"
                  onClick={() => setPopupOpen({ open: true, data: {...lesson, updateIndex: index} })}
                >
                  <h1 className="lesson-number">{index + 1}</h1>
                  <div className="lesson-title-cnt">
                    <h3 className="lesson-title">{lesson.title}</h3>
                  </div>
                  <ul className="lesson-subtitle-cnt">
                    {lesson.chapter?.map((sublesson, idx) => (
                      <li key={idx}>
                        <p className="lesson-subtitle">{sublesson.title}</p>
                        <p className="lesson-duration-txt">
                          duration: {sublesson.duration}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="no-lesson-cnt">
                <img
                  src={Nolesson}
                  alt="no-lesson"
                  className="empty-lesson-img"
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {popupOpen.open && (
        <NewLesson
          addLesson={addLessontoCourse}
          editData={popupOpen.data}
          cancel={() => setPopupOpen({ open: false, data: null })}
          removeThisLesson={removeLessonFromCourse}
        />
      )}
    </div>
  );
};

export default NewCourse;
