import React, { useEffect, useState } from 'react';
import { postData } from '../Utils/apiCall';


const MainPage = () => {
    // State to store the uploaded image previews and base64 encoded images
    const [imagePreviews, setImagePreviews] = useState([]);
    const [base64Images, setBase64Images] = useState([]);
    const [control, setcontrol] = useState()
    const [lane, setlane] = useState()
    const [loading, setloading] = useState(false)
    // Function to handle image preview and base64 encoding



    const handleImagePreview = (event) => {
        const files = event.target.files;
        if (files.length > 4) {
            alert("You can only upload up to 4 images.");
            return;
        }

        const previews = [];
        const base64Array = [];

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result);
                base64Array.push(reader.result.split(',')[1]); // Remove the data:image/...;base64, part
                if (previews.length === files.length) {
                    setImagePreviews(previews);
                    setBase64Images(base64Array);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setCountdown(0)
        setloading(true)
        const data = await postData({ images: base64Images }, "/upload");
        setloading(false)
        console.log(data)
        if (data) {
            setcontrol(data)
            setlane(data?.lane)
        }
        changeSignal(data.green_time)
    };

    const [countdown, setCountdown] = useState(0); // Initialize countdown state
    const [shouldStartCountdown, setShouldStartCountdown] = useState(false); // Control when to start the countdown

    const changeSignal = (time) => {
        // Start the countdown
        setShouldStartCountdown(true);
        setCountdown(time);
    };

    useEffect(() => {
        if (shouldStartCountdown && countdown > 0) {
            const timerId = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 300); // Countdown every second
            
            // Cleanup function to clear the interval if the component unmounts
            // or if the countdown should stop for any reason
            return () => {
                clearInterval(timerId);
            };
        } else if (!shouldStartCountdown && countdown === 0) {
            // Once countdown reaches 0, perform any final actions
            console.log("in")
            setlane();
        }
        console.log(countdown,lane)
    }, [countdown, shouldStartCountdown]); // Re-run effect whenever `countdown` or `shouldStartCountdown` changes

    // Rest of your component...


    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 py-">
            <div className="w-3/4 flex-col items-center justify-center">
                <div className='w-1/2 mx-auto'>
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Upload Images
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-1">
                            <div>
                                <label htmlFor="images" className="sr-only">
                                    Choose images
                                </label>
                                <input id="images" name="images" type="file" multiple className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" onChange={handleImagePreview} />
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Upload
                            </button>
                        </div>
                    </form>
                </div>
                <div className={`${loading ? "block" : "hidden"} text-2xl text-red-500 text-center font-semibold `}>
                    Analysing...
                </div>
                <ul className={`${imagePreviews?.length != 0 ? "" : "hidden "}grid grid-cols-4 gap-4 mt-4 w-full p-3 border border-indigo-400 rounded-md`}>
                    {imagePreviews.map((preview, index) => (
                        <li key={index} className="grid justify-center space-y-3 items-center place-items-center">
                            <img src={preview} alt={`Preview ${index}`} className="aspect-square h-auto object-cover rounded-md" />
                            <div className='p-2 rounded-md bg-black flex items-center gap-3 w-fit'>
                                <div className={`rounded-full ${lane != index || countdown==0? "bg-red-500" : ""} aspect-square w-12 border border-red-500`}></div>
                                <div className={`rounded-full ${lane == index && countdown!=0? "bg-green-500" : ""} aspect-square w-12 border border-green-500 flex items-center justify-center`}></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <p className='text-2xl text-center p-2 rounded-md bg-gray-200 mt-2'>{countdown} sec</p>
        </div>
    );
};

export default MainPage;
