import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import axios from 'axios';
import "./Statistics.css";

const Statistics = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [timeSpentData, setTimeSpentData] = useState({
    Sunday: 5,
    Monday: 10,
    Tuesday: 7,
    Wednesday: 12,
    Thursday: 6,
    Friday: 8,
    Saturday: 14,
  });

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
        const coursesResponse = await axios.get(`${apiBaseUrl}/courseDetail`);
        const allCourses = coursesResponse.data;

        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem("userDataUpdated"));

        if (userInfo && userInfo.coursePurchased) {
          const { coursePurchased } = userInfo;

          // Map through purchased courses and combine with course details
          const enrolledCoursesWithProgress = coursePurchased
            .map((purchasedCourse) => {
              const courseDetails = allCourses.find(
                (course) => course._id === purchasedCourse.courseId
              );
              if (courseDetails) {
                return {
                  ...courseDetails,
                  progress: purchasedCourse.progress || 0,
                };
              }
              return null;
            })
            .filter(Boolean); // Remove null values

          setEnrolledCourses(enrolledCoursesWithProgress);

          // Set first course as default selected
          if (enrolledCoursesWithProgress.length > 0) {
            setSelectedCourse(enrolledCoursesWithProgress[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleCourseChange = (event) => {
    const course = enrolledCourses.find((c) => c._id === event.target.value);
    setSelectedCourse(course);
  };

  return (
    <div className="statistics">
      <div className="time-spent">
        <h3>Time Spent</h3>
        <div className="chart-container">
          <div className="chart-title">Weekly Time Distribution</div>
          <Chart data={timeSpentData} isTimeSpent={true} />
          <div className="chart-legend">
            {Object.keys(timeSpentData).map((day) => (
              <div key={day}>
                <span className={`legend-${day.toLowerCase()}`}></span>
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="completion">
        <h3>Course Completion</h3>
        <div className="course-selector">
          <select
            value={selectedCourse?._id || ''}
            onChange={handleCourseChange}
            className="course-select"
          >
            <option value="" disabled>Select a course</option>
            {enrolledCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse ? (
          <>
            <p className="selected-course">
              Showing completion status for: {selectedCourse.title}
            </p>
            <div className="completion-progress">
              <p>Overall Progress: {Math.round(selectedCourse.progress)}%</p>
            </div>
            <Chart data={{ progress: selectedCourse.progress }} isTimeSpent={false} />
          </>
        ) : (
          <p>No courses enrolled</p>
        )}
      </div>
    </div>
  );
};

export default Statistics;