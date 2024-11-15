import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CourseContent.css";
import tick from "../Assets/SVG/tick.svg";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "../LoadingPage/LoadingPage";
import Accordion from "react-bootstrap/Accordion";
import ErrorDataFetchOverlay from "../Error/ErrorDataFetchOverlay";
import ProgressBar from "../ProgressBar/ProgressBar";

const CourseContent = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [userId, setUserId] = useState("");
  const [courseData, setCourseData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedID, setFetchedID] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentCourseData, setCurrentCourseData] = useState({});

  // nxt btn
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);
  const [activeAccordion, setActiveAccordion] = useState(null);

  // progress
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [watchedVideoTitles, setWatchedVideoTitles] = useState([]);

  // api data
  const [completedUserData, setCompletedUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(
          `https://csuite-ui0f.onrender.com/api/courseDetail/${courseId}`
        );
        setCourseData(response.data);
        // console.log(response.data.course);

        const userInfo = localStorage.getItem("userid");
        // console.log(userInfo)
        if (userInfo) {
          const userID = userInfo;
          setUserId(userID);
        } else {
          setFetchError(true);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setIsLoading(false);
        setFetchError(true);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCompletedVideos = async () => {
      if (!userId) return;

      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

        const response = await axios.get(
          `https://csuite-ui0f.onrender.com/api/completevideo/${userId}/${courseId}`
        );

        const data = response.data.completedUserData;
        // console.log("Fetched data:", data[0].completedVideos);
        setCompletedUserData(data[0].completedVideos);

        if (data.length > 0) {
          const firstItem = data[0];
          const completedTitles = firstItem.completedVideos;

          // Initialize completedExercises
          const completedSet = new Set(
            firstItem.completedVideos.flatMap((videoTitle) =>
              courseData.lessons.flatMap((lesson, lessonIndex) =>
                lesson.chapter.flatMap((video, videoIndex) =>
                  video.title === videoTitle
                    ? [`${lessonIndex}-${videoIndex}`]
                    : []
                )
              )
            )
          );
          setCompletedExercises(completedSet);
          setFetchedID(firstItem._id);
          setWatchedVideoTitles(completedTitles);

          // console.log("Completed video titles:", completedTitles);
        } else {
          console.log("No completed videos found.");
          setCompletedUserData([]);
          setWatchedVideoTitles([]);
          setCompletedExercises(new Set());
        }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 404) {
            // const message =
            //   err.response.data.message ||
            //   "No completed videos found. This might be normal.";
            // console.log(message);
            setCompletedUserData([]);
            setWatchedVideoTitles([]);
            setCompletedExercises(new Set());

            try {
              const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

              await axios.post(
                `https://csuite-ui0f.onrender.com/api/completevideo/`,
                {
                  userId,
                  courseId,
                  completedVideos: [],
                }
              );
              // alert("posting in effect");
              // console.log("New entry created with empty completed videos.");
            } catch (postErr) {
              console.error(
                "Error creating new completed video entry:",
                postErr
              );
            }
          } else {
            console.error(
              "Error fetching completed videos:",
              err.response.data.message || err.message || err
            );
          }
        } else {
          console.error("Error fetching completed videos:", err.message || err);
        }
      }
    };

    fetchCompletedVideos();
  }, [userId, courseId]);

  const handleLessonClick = (index) => {
    setActiveLesson(index === activeLesson ? null : index);
    setActiveAccordion(index === activeLesson ? null : index);
  };

  const calculateTotalDuration = (videos) => {
    let totalSeconds = 0;
    videos?.forEach((video) => {
      if (video.duration) {
        const timeComponents = video.duration.split(":").map(Number);
        totalSeconds += timeComponents[0] * 60 + timeComponents[1];
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`;
  };

  function convertToReadableDuration(duration) {
    if (!duration || duration === "0") {
      return "3mins+";
    }

    const [minutes, seconds] = duration.split(":");
    return `${parseInt(minutes, 10)}m ${parseInt(seconds, 10)}s`;
  }

  // currentcourse kkaaga ethu
  const handleCurrentContent = async (data, lessonIndex, excerciseIndex) => {
    const exerciseKey = `${lessonIndex}-${excerciseIndex}`;
    // Update completedExercises set
    setCompletedExercises((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(exerciseKey);
      // console.log("Updated completedExercises:", Array.from(updatedSet));
      return updatedSet;
    });

    // Update watchedVideoTitles array
    setWatchedVideoTitles((prevTitles) => {
      const updatedTitles = new Set(prevTitles);
      updatedTitles.add(data.title);
      // console.log("Updated watchedVideoTitles:", Array.from(updatedTitles));
      return Array.from(updatedTitles);
    });

    // Modify data and set current course data
    const modifiedData = {
      ...data,
      excerciseNo: excerciseIndex + 1,
      lessonNo: lessonIndex + 1,
      type: data.type,
      link: data.link,
      duration: data.duration,
    };
    setCurrentCourseData(modifiedData);

    // Update lesson and video indices
    setCurrentLessonIndex(lessonIndex);
    setCurrentVideoIndex(excerciseIndex);
    setActiveAccordion(lessonIndex);

    // console.log("Updating completed videos with data:", {
    //   lesson: data.title,
    // });

    try {
      const videoAlreadyCompleted = completedUserData.includes(data.title);

      if (!videoAlreadyCompleted) {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

        // Video already completed, update if necessary
        await axios.put(
          `https://csuite-ui0f.onrender.com/api/completevideo/${fetchedID}/updatelesson`,
          { lesson: data.title }
        );
      }
    } catch (err) {
      console.error("Error handling current content:", err);
    }
  };

  const handleNext = async () => {
    if (courseData.lessons) {
      const currentLesson = courseData.lessons[currentLessonIndex];

      if (currentLessonIndex === 0 && currentVideoIndex === -1) {
        handleCurrentContent(currentLesson.chapter[0], currentLessonIndex, 0);
      } else if (currentVideoIndex < currentLesson.chapter.length - 1) {
        handleCurrentContent(
          currentLesson.chapter[currentVideoIndex + 1],
          currentLessonIndex,
          currentVideoIndex + 1
        );
      } else if (currentLessonIndex < courseData.lessons.length - 1) {
        const nextLesson = courseData.lessons[currentLessonIndex + 1];
        handleCurrentContent(nextLesson.chapter[0], currentLessonIndex + 1, 0);
      } else {
        const totalExercises = courseData.lessons.reduce(
          (total, lesson) => total + lesson.chapter.length,
          0
        );
        if (completedExercises.size === totalExercises) {
          alert("Congratulations! You have completed the course!");
        } else {
          alert("There are a few lessons you need to complete!");
        }
      }
    }
  };

  const renderEmbeddedPPT = (link) => {
    // console.log(link);

    const fileIdMatch = link.match(/\/d\/([^/]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : null;

    if (!fileId) {
      return <p>Error: Invalid link format</p>;
    }

    const googleEmbedUrl = `https://docs.google.com/presentation/d/${fileId}/embed`;
    const officeEmbedUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      link
    )}`;

    return (
      <div>
        <iframe
          title="PPT Viewer"
          src={googleEmbedUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="autoplay; encrypted-media"
          onError={(e) => {
            e.target.src = officeEmbedUrl;
          }}
        />
        <p>
          If the viewer fails to load,{" "}
          <a href={link} target="_blank" rel="noopener noreferrer">
            download the PPT file
          </a>
          .
        </p>
      </div>
    );
  };

  const renderContent = (link, typeManual) => {
    if (typeManual === "video") {
      return (
        <div>
          <iframe
            title={currentCourseData.title || "Video Title"}
            className="embed-responsive-item"
            sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
            src={`https://player.vimeo.com/video/${link.split("/").pop()}`}
            style={{ width: "100%", height: "100%" }}
            allow="autoplay; encrypted-media"
          ></iframe>
        </div>
      );
    } else if (typeManual === "ppt") {
      // const fileId = link.split("/d/")[1].split("/")[0];
      // const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      // return (
      //   <div>
      //     <iframe
      //       title="PPT"
      //       className="embed-responsive-item"
      //       src={embedUrl}
      //       style={{ width: "100%", height: "100%" }}
      //       allow="autoplay; encrypted-media"
      //     ></iframe>
      //   </div>
      // );
      return renderEmbeddedPPT(link);
    }
  };

  const calculateProgress = () => {
    const totalExercises = courseData.lessons?.reduce(
      (total, lesson) => total + lesson.chapter?.length,
      0
    );
    const progress =
      totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;

    return progress;
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
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
    <div className="courseContentContainer">
      <div className="row firstRow g-0">
        <div className="courseContentHeader">
          <button className="BackBtn" onClick={() => navigate(-1)}>
            Back
          </button>
          <div className="courseHeading">
            {truncateText(courseData.title, 45)}
          </div>
          <button className="NextBtn" onClick={() => handleNext()}>
            Next
          </button>
        </div>
        <div className="courseContentProgressBar">
          <ProgressBar progress={calculateProgress()} />
        </div>{" "}
      </div>
      <div className="row secondRow">
        <div className="col-md-8 pdy">
          <div className="videoBox">
            <div className="embed-responsive embed-responsive-16by9">
              {courseData?.lessons.length > 0 &&
                renderContent(
                  !currentCourseData.link
                    ? courseData.videoUrl
                    : currentCourseData.link,
                  !currentCourseData.link ? "video" : currentCourseData.type
                )}
            </div>
            <div>
              <div className="infoBox">
                <h1>{courseData.title}</h1>
                {courseData.lessons && courseData.lessons.length > 0 && (
                  <div className="lessonDescriptionBox">
                    <h3 className="lessonDescriptionBoxTitle">
                      {!currentCourseData.title
                        ? ""
                        : `${currentCourseData.lessonNo}.${currentCourseData.excerciseNo}`}{" "}
                      {!currentCourseData.title
                        ? courseData.lessons[0].title
                        : currentCourseData.title}
                      {/* {courseData.lessons[0].title} */}
                    </h3>
                    <p className="lessonDescriptionBoxDescription">
                      {!currentCourseData.notes
                        ? courseData.lessons[0].description
                        : currentCourseData.notes}
                      {/* {courseData.lessons[0].description} */}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 CCaccordianBox">
          <Accordion activeKey={activeAccordion} onSelect={handleLessonClick}>
            {courseData?.lessons &&
              courseData.lessons?.map((lesson, index) => {
                const lessonCompleted = lesson.chapter?.every((_, vidIndex) =>
                  completedExercises.has(`${index}-${vidIndex}`)
                );

                return (
                  <Accordion.Item key={index} eventKey={index}>
                    <Accordion.Header
                      onClick={() => handleLessonClick(index)}
                      className={
                        !currentCourseData.title
                          ? ""
                          : `${
                              currentCourseData.lessonNo === index + 1
                                ? "accr-btn-active"
                                : ""
                            }`
                      }
                    >
                      <div className="CClesson-meta">
                        <div className="CClesson-title">
                          <div>
                            {index + 1}&nbsp;.&nbsp;{lesson.title}
                          </div>

                          {lessonCompleted && (
                            <img
                              className="content-watched"
                              src={tick}
                              alt="watched"
                            />
                          )}
                        </div>
                        <span className="lesson-duration">
                          Duration : {calculateTotalDuration(lesson?.chapter)}{" "}
                          &nbsp; /&nbsp;
                        </span>

                        <span>Total Content : {lesson.chapter?.length}</span>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div>
                        <ul className="list-group">
                          {lesson.chapter?.map((video, vidIndex) => (
                            <li
                              key={vidIndex}
                              className={`list-group-item 
             ${
               currentCourseData.title === video.title
                 ? "list-group-item-active"
                 : completedExercises.has(`${index}-${vidIndex}`)
                 ? "completedLesson"
                 : ""
             }`}
                              onClick={() =>
                                handleCurrentContent(video, index, vidIndex)
                              }
                            >
                              <span className="video-number">
                                {/* <a href={video.link}>
                                  {`${index + 1}.${vidIndex + 1}`}&nbsp;
                                  {video.title}
                                </a> */}
                                <div>
                                  {`${index + 1}.${vidIndex + 1}`}&nbsp;
                                  {video.title}
                                </div>

                                {completedExercises.has(
                                  `${index}-${vidIndex}`
                                ) && (
                                  <img
                                    className="content-watched"
                                    src={tick}
                                    alt="watched"
                                  />
                                )}
                              </span>
                              {video?.type === "video" ? (
                                <span className="lesson-duration">
                                  Duration :{" "}
                                  {convertToReadableDuration(video.duration)}
                                </span>
                              ) : (
                                <span className="lesson-duration">
                                  Type : {video?.type}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                        {lesson.testId && (
                          <div className="testButtonBox">
                            <div className="testButtonInr">
                              <div className="testButtonTxt">
                                Take a Test to Confirm Your Understanding
                              </div>

                              <button
                                className="testButton"
                                onClick={() =>
                                  navigate(
                                    `/home/tests/${lesson.testId}/user/${userId}`
                                  )
                                }
                              >
                                Take Test
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
