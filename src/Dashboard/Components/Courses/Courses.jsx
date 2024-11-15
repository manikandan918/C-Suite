import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Courses.css";
import { useNavigate } from "react-router-dom";
import imgd from "../Assets/Images/imagenotxt2.png";
import LoadingPage from "../LoadingPage/LoadingPage";
import ErrorDataFetchOverlay from "../Error/ErrorDataFetchOverlay";

const Courses = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [allLessons, setAllLessons] = useState([]);
  const [coursesData, setCoursesData] = useState([]); // To store all courses
  const [fetchError, setFetchError] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(
          `https://csuite-ui0f.onrender.com/api/courseDetail/`
        );
        const allCourses = response.data;

        // Handle user info and purchased courses, but no filtering for now
        const userInfo = JSON.parse(localStorage.getItem("userDataUpdated"));
        if (userInfo) {
          const { coursePurchased } = userInfo;
          const purchasedCourseIds = coursePurchased.map(
            (course) => course.courseId
          );
          // Optionally, mark purchased courses, add them as a property if needed
          allCourses.forEach(course => {
            course.isPurchased = purchasedCourseIds.includes(course._id);
          });
          setCoursesData(allCourses); // Store all courses (purchased + not purchased)
        } else {
          setFetchError(true);
          alert("User not logged in, Go to Profile page");
          console.log("No user info found in localStorage");
        }

        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        setFetchError(true);
      }
    };
    fetchData();
  }, []);

  const resolveImagePath = (imagePath) => {
    if (
      imagePath &&
      (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    ) {
      return imagePath;
    } else if (imagePath && imagePath.startsWith("base64")) {
      return imgd;
    } else {
      try {
        return require(`../Assets/Images/${imagePath}`);
      } catch (error) {
        return imgd;
      }
    }
  };

  useEffect(() => {
    const getAllLessons = () => {
      let lessons = [];
      try {
        coursesData.forEach((course) => {
          course.lessons.forEach((lesson) => {
            if (!lessons.includes(lesson.title)) {
              lessons.push(lesson.title);
            }
          });
        });

        // Random
        for (let i = lessons.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lessons[i], lessons[j]] = [lessons[j], lessons[i]];
        }
      } catch (err) {
        console.log(err);
      }
      return lessons.slice(0, 10);
    };

    if (coursesData.length > 0) {
      const lessons = getAllLessons();
      setAllLessons(lessons);
    }
  }, [coursesData]);

  const getLessonList = (lessons) => {
    const MAX_WORD_COUNT = 20;
    let totalWords = 0;
    let lessonList = [];

    for (let i = 0; i < lessons.length && i < 3; i++) {
      const lesson = lessons[i];
      if (!lesson.title) continue;
      const wordCount = lesson.title.split(" ").length;

      if (totalWords + wordCount > MAX_WORD_COUNT) {
        break;
      }

      totalWords += wordCount;
      lessonList.push(lesson);
    }

    return lessonList;
  };

  const filterCourses = (filters) => {
    try {
      if (filters.length === 0) {
        return coursesData;
      } else {
        return coursesData.filter((course) =>
          course.lessons.some((lesson) => filters.includes(lesson.title))
        );
      }
    } catch (err) {
      console.log(err);
      setFetchError(true);
      return [];
    }
  };

  const handleFilterClick = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const truncateDescription = (description) => {
    const words = description.split(" ");
    const truncated = words.slice(0, 15).join(" ");
    return truncated;
  };

  if (isLoading) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  if (fetchError) {
    return <ErrorDataFetchOverlay />;
  }

  return (
    <>
      <div className="main-content">
        <div className="cardContainer3">
          <h2>Courses</h2>
          <button
        className="back-btn"
        onClick={() => navigate(-1)}  
      >
        Back
      </button>
          {/* <div className="filterChips">
            {allLessons.map((lesson, index) => (
              <div
                key={index}
                className={`filterChip ${selectedFilters.includes(lesson) ? "active" : ""}`}
                onClick={() => handleFilterClick(lesson)}
              >
                {lesson}
              </div>
            ))}
            {selectedFilters.length > 0 && (
              <button className="clearFilters" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div> */}
          <div className="courseContainer3">
            {filterCourses(selectedFilters).map((course) => (
              <div className="courseCard3" key={course._id}>
                <div className="courseOverlay3">
                  <div className="courseImageBox3">
                    <img
                      src={course.image ? resolveImagePath(course.image) : imgd}
                      alt={course.title}
                      className="courseImage3"
                    />
                    <div className="courseImageTxt3">{course.title}</div>
                  </div>
                  <div className="courseDetails3">
                    <p>{truncateDescription(course.description)}...</p>
                    <button className="courseDetailBtn3">View Details</button>
                  </div>
                </div>
                <div className="courseLessonBox3">
                  <h5>Lessons</h5>
                  <ul>
                    {getLessonList(course.lessons).map((lesson, index) => (
                      <li key={index}>{lesson.title}</li>
                    ))}
                    {course.lessons.length > getLessonList(course.lessons).length && (
                      <li>...and more</li>
                    )}
                  </ul>
                  <button
                    onClick={() => navigate(`/home/courseDetails/${course._id}`)}
                    className="lessonDetailBtn3"
                  >
                    View Course
                  </button>
                  {/* Optionally, display if purchased */}
                  {course.isPurchased && <span className="purchasedLabel">Purchased</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;
