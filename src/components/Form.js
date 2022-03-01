import * as React from "react";
import axios from "axios";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useForm } from "react-hook-form";

export default function Form({ onChildClick }) {
  const {
    watch,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "all" });
  const [disabled, setDisabled] = React.useState(false);
  const [formComplete, setFormComplete] = React.useState(false);
  const [recaptchaPassed, setRecaptchaPassed] = React.useState(null);
  const [selectedRequest, setSelectedRequest] = React.useState(
    watch("request", null)
  );
  // const [showNext, setShowNext] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [previousStep, setPreviousStep] = React.useState(null);

  React.useEffect(() => {
    const subscription = watch((data) => {
      if (data.request) {
        setSelectedRequest(data.request);
        // setShowNext(true);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch]);

  /**
   *
   * @param {array} values
   */
  const onSubmit = async (values) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, { action: "submit" })
        .then((token) => {
          submitData(values, token);
        });
    });
  };

  /**
   *
   * @param {array} values
   * @param {string} recaptchaToken
   */
  const submitData = async (values, recaptchaToken) => {
    setDisabled(true);
    try {
      const {
        name,
        email,
        building,
        department,
        request,
        videoEventName,
        videoEventDescription,
        videoLocation,
        videoEventDate,
        videoEventTime,
        photoEventName,
        photoEventDate,
        photoEventTime,
        photoEventDescription,
        flyerDescription,
        flyerDeadline,
        flyerDistribution,
        logoDescription,
        additionalInformation,
      } = values;
      await axios({
        url: "/api/createTrelloCard",
        method: "POST",
        data: {
          name,
          email,
          building,
          department,
          request,
          recaptchaToken,
          videoEventName,
          videoEventDescription,
          videoLocation,
          videoEventDate,
          videoEventTime,
          photoEventName,
          photoEventDate,
          photoEventTime,
          photoEventDescription,
          flyerDescription,
          flyerDeadline,
          flyerDistribution,
          logoDescription,
          additionalInformation,
        },
      }).then((res) => {
        if (res.status === 200) {
          reset();
          setFormComplete(true);
          setDisabled(false);
          setStep(1);
        } else {
          setRecaptchaPassed(false);
        }
      });
    } catch (error) {
      if (error.response) {
        console.log(
          "Server responded with non 2xx code: ",
          error.response.data
        );
      } else if (error.request) {
        console.log("No response received: ", error.request);
      } else {
        console.log("Error setting up response: ", error.message);
      }
    }
  };

  return (
    <HelmetProvider>
      <div className="text-white mx-4 md:mx-2 lg:mx-0">
        <Helmet>
          <script
            key="recaptcha"
            type="text/javascript"
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.REACT_APP_RECAPTCHA_SITE_KEY}`}
          />
        </Helmet>
        <button
          onClick={onChildClick}
          className="block mx-auto bg-black px-3 py-2 border border-white rounded my-4 md:my-6 lg:my-8"
        >
          {!formComplete ? "Cancel Request" : "Close"}
        </button>
        <hr />
        {!formComplete ? (
          <p className="my-4 md:my-6 lg:my-8">
            We are happy you are interested in using our studio's services.
            Please take a moment to fill out our form below. Be sure to complete
            all of the fields in order to move through the form. Before clicking
            the submit button, you will see a preview of the information we have
            collected below the button.
          </p>
        ) : (
          <p className="my-4 md:my-6 lg:my-8 text-green-500">
            Your request has been received. You can anticipate a reply within 24
            hours.
          </p>
        )}
        {!formComplete && (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1">
            {/* FORM PART 1 */}
            <Step1 step={step} register={register} errors={errors} />
            {/* FORM PART 2 (VIDEO) */}
            {step >= 2 && selectedRequest === "video" && (
              <Step2 step={step} register={register} errors={errors} />
            )}
            {/* FORM PART 3 (PHOTOGRAPHY) */}
            {step >= 3 && selectedRequest === "photography" && (
              <Step3 step={step} register={register} errors={errors} />
            )}
            {/* FORM PART 4 (FLYERS) */}
            {step >= 4 && selectedRequest === "flyer" && (
              <Step4 step={step} register={register} errors={errors} />
            )}
            {/* FORM PART 5 (LOGO) */}
            {step >= 5 && selectedRequest === "logo" && (
              <Step5 step={step} register={register} errors={errors} />
            )}
            {/* FORM PART 6 (ADDITIONAL INFORMATION) */}
            {step >= 6 && <Step6 step={step} register={register} />}

            <div className={`grid grid-cols-2 gap-x-4`}>
              {!isValid && (
                <p className="text-red-500 col-span-2 text-center my-3 md:my-4 lg:my-6">
                  Please complete all required fields before moving on.
                </p>
              )}
              <button
                type="button"
                className={`bg-stone-700 text-white rounded px-3 py-2 border border-stone-200 transition duration-500 ease-in-out opacity-100 ${
                  step === 1 && `invisible`
                }`}
                onClick={() => {
                  if (step < 6) {
                    setStep(1);
                  } else {
                    setStep(previousStep);
                  }
                  // setShowNext(true);
                }}
              >
                Previous
              </button>
              {step === 6 ? (
                <input
                  disabled={disabled}
                  type="submit"
                  value="Submit"
                  name="submit"
                  className={`bg-green-500 px-3 py-2 rounded ${
                    !disabled && ` cursor-pointer`
                  }`}
                />
              ) : (
                <button
                  type="button"
                  disabled={!isValid}
                  className={`${
                    isValid
                      ? ` bg-stone-700 text-white border-green-500`
                      : `bg-stone-800 text-stone-500 border-red-500`
                  } text-white rounded px-3 py-2 border  transition duration-500 ease-in-out opacity-100 
              }`}
                  onClick={() => {
                    if (step === 1) {
                      switch (selectedRequest) {
                        case "video":
                          setStep(2);
                          setPreviousStep(1);
                          // setShowNext(false);
                          break;
                        case "photography":
                          setStep(3);
                          // setShowNext(false);
                          break;
                        case "flyer":
                          setStep(4);
                          // setShowNext(false);
                          break;
                        case "logo":
                          setStep(5);
                          // setShowNext(false);
                          break;
                        default:
                          setStep(6);
                        // setShowNext(false);
                      }
                    } else {
                      setPreviousStep(step);
                      setStep(6);
                    }
                  }}
                >
                  Next
                </button>
              )}
            </div>

            <p className="text-sm my-4 md:my-6 lg:my-8">
              Preview of Details to be submitted:
            </p>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(watch(), null, 2)}
            </pre>
          </form>
        )}
      </div>
    </HelmetProvider>
  );
}

/**
 *
 * @param {object} props
 * @returns JSX
 */
const Step1 = ({ step, register, errors }) => {
  return (
    <div className={`${step > 1 && ` hidden`}`}>
      <label
        htmlFor="name"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4 border-b border-white"
      >
        <span className="sr-only">Enter your first and last names</span>
        <input
          type="text"
          name="name"
          placeholder="Please Enter Your Full Name"
          className="rounded h-10 text-white bg-stone-900 text-xl block w-full px-4 py-1"
          {...register("name", {
            required: "Your name is required.",
          })}
        />
      </label>
      {errors.name && (
        <p className="text-red-500 ">&uarr; {errors.name.message}</p>
      )}
      <label
        htmlFor="email"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4 border-b border-white"
      >
        <span className="sr-only">Enter your email username</span>
        <input
          type="text"
          name="first-name"
          placeholder="Your Username"
          className="rounded h-10 w-1/2 text-white bg-stone-900  md:text-lg lg:text-xl mr-1 text-center px-4 py-1 "
          {...register("email", {
            required: "Your email username is required.",
          })}
        />
        @longbranch.k12.nj.us
      </label>
      <label
        htmlFor="building"
        className="block my-2 md:my-3 lg:my-4 py-1 md:text-lg lg:text-xl"
      >
        <span className="sr-only">Select Your Building</span>
        <select
          defaultValue={"DEFAULT"}
          name="building"
          className="mt-4 md:mt-5 lg:mt-6 block rounded h-10 w-full text-white bg-stone-900 md:text-lg lg:text-xl mr-1 text-center py-1 "
          {...register("building", {
            required: "A building is required.",
            pattern: "^((?!Select).)*$",
          })}
        >
          <option value="DEFAULT" disabled>
            -- select your building --
          </option>
          <option value="540">540 Broadway</option>
          <option value="AAA">Amerigo A. Anastasia School</option>
          <option value="ALT">Alternative Academy</option>
          <option value="GLC">George L. Catrambone School</option>
          <option value="GRE">Gregory School</option>
          <option value="JMF">Joseph M. Ferraina ECLC</option>
          <option value="LWC">Lenna W. Conrow ECLC</option>
          <option value="LBHS">Long Branch High School</option>
          <option value="SOSJ">LBHS School of Social Justice</option>
          <option value="LBMS">Long Branch Middle School</option>
          <option value="MOR">Morris Avenue ECLC</option>
          <option value="WAV">Little Waves</option>
          <option value="OTH">Other</option>
        </select>
      </label>
      <label
        htmlFor="department"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4 border-b border-white"
      >
        <span className="sr-only">Enter your department</span>
        <input
          type="text"
          name="department"
          placeholder="Please Enter Your Department"
          className="rounded h-10 text-white bg-stone-900 text-xl block w-full px-4 py-1"
          {...register("department", {
            required: "Your name is required.",
          })}
        />
      </label>
      <div className="flex flex-col space-y-4 md:text-lg lg:text-xl my-2 md:my-3 lg:my-4">
        <p>I am requesting...</p>
        <div>
          <input
            type="radio"
            id="requestChoice1"
            name="request"
            value="video"
            className="ml-4 accent-green-500"
            {...register("request", {
              required: "A request type is required.",
            })}
          />
          <label htmlFor="requestChoice1" className="ml-4">
            Video Production (Filming &amp; Editing)
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="requestChoice2"
            name="request"
            value="photography"
            className="ml-4 accent-green-500"
            {...register("request", {
              required: "A request type is required.",
            })}
          />
          <label htmlFor="requestChoice2" className="ml-4">
            Photography
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="requestChoice3"
            name="request"
            value="flyer"
            className="ml-4 accent-green-500"
            {...register("request", {
              required: "A request type is required.",
            })}
          />
          <label htmlFor="requestChoice3" className="ml-4">
            Flyer Creation
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="requestChoice4"
            name="request"
            value="logo"
            className="ml-4 accent-green-500"
            {...register("request", {
              required: "A request type is required.",
            })}
          />
          <label htmlFor="requestChoice4" className="ml-4">
            Logo Creation
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="requestChoice5"
            name="request"
            value="other"
            className="ml-4 accent-green-500"
            {...register("request", {
              required: "A request type is required.",
            })}
          />
          <label htmlFor="requestChoice5" className="ml-4">
            Other (Option not listed)
          </label>
        </div>
      </div>
    </div>
  );
};
/**
 * Step 2 (VIDEO) of Media Request Form
 * @returns JSX
 */
const Step2 = ({ step, register, errors }) => {
  return (
    <div className={`${step !== 2 && ` hidden `}`}>
      <h2 className="font-bold text-xl md:text-2xl text-center">
        Video Production (Filming &amp; Editing)
      </h2>
      <label
        htmlFor="videoEventName"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4 "
      >
        <span className="sr-only">Enter your event name</span>
        <input
          type="text"
          name="videoEventName"
          placeholder="Please Enter Your Event Name (Reason for Video)"
          className="rounded h-10 text-white bg-stone-900 text-xl block w-full px-4 py-1"
          {...register("videoEventName", {
            required: "Your event name or reason is required.",
          })}
        />
      </label>
      {errors.videoEventName && (
        <p className="text-red-500">&uarr; {errors.videoEventName.message}</p>
      )}
      <div className="flex flex-col space-y-4 md:text-lg lg:text-xl my-2 md:my-3 lg:my-4">
        <p>Event / Recording Location</p>
        <div>
          <input
            type="radio"
            id="videoLocationChoice1"
            name="videoLocation"
            value="540"
            className="ml-4 accent-green-500"
            {...register("videoLocation", {
              required: "An event/recording location is required.",
            })}
          />
          <label htmlFor="videoLocationChoice1" className="ml-4">
            Studio @540 Broadway
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="videoLocationChoice2"
            name="videoLocation"
            value="other"
            className="ml-4 accent-green-500"
            {...register("videoLocation", {
              required: "An event/recording location is required.",
            })}
          />
          <label htmlFor="videoLocationChoice2" className="ml-4">
            Other
          </label>
        </div>
      </div>
      <label
        htmlFor="videoEventDate"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        <span>Enter your event date</span>
        <input
          type="date"
          name="videoEventDate"
          placeholder="Please Enter Your Event Date"
          className="rounded h-10 text-white bg-stone-900 text-xl block px-4 py-1 my-4"
          {...register("videoEventDate", {
            required: "Your event date is required.",
          })}
        />
      </label>
      {errors.videoEventDate && (
        <p className="text-red-500">&uarr; {errors.videoEventDate.message}</p>
      )}
      <label
        htmlFor="videoEventTime"
        className="md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        <span>Enter your event time</span>
        <input
          type="time"
          name="videoEventTime"
          placeholder="Please Enter Your Event Time"
          className="rounded h-10 text-white bg-stone-900 text-xl block px-4 py-1 my-4 focus:outline-none focus:ring-4 focus:ring-green-500 rounded-sm transition duration-150 ease-in-out"
          {...register("videoEventTime", {
            required: "Your event time is required.",
          })}
        />
      </label>
      {errors.videoEventTime && (
        <p className="text-red-500">&uarr; {errors.videoEventTime.message}</p>
      )}
      <label
        htmlFor="videoEventDescription"
        className="md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        Please describe your event
      </label>
      <textarea
        rows="10"
        name="videoEventDescription"
        className="block w-full mb-3 px-0.5 bg-stone-900 focus:outline-none focus:ring-4 focus:ring-green-500 rounded-sm transition duration-150 ease-in-out "
        {...register("videoEventDescription", {
          required: "Your event description is required.",
        })}
      />
      {errors.videoEventDescription && (
        <p className="text-red-500">
          {" "}
          &uarr; {errors.videoEventDescription.message}
        </p>
      )}
    </div>
  );
};

/**
 * Step 3 (PHOTOGRAPHY) of Media Request Form
 * @returns JSX
 */
const Step3 = ({ step, register, errors }) => {
  return (
    <div className={`${step !== 3 && ` hidden `}`}>
      <h2 className="font-bold text-xl md:text-2xl text-center">
        Photography Event
      </h2>
      <label
        htmlFor="photoEventName"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4 "
      >
        <span className="sr-only">Enter your event name</span>
        <input
          type="text"
          name="photoEventName"
          placeholder="Please Enter Your Event Name"
          className="rounded h-10 text-white bg-stone-900 text-xl block w-full px-4 py-1"
          {...register("photoEventName", {
            required: "Your event name or reason is required.",
          })}
        />
      </label>
      {errors.photoEventName && (
        <p className="text-red-500">&uarr; {errors.photoEventName.message}</p>
      )}
      <label
        htmlFor="photoEventDate"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        <span>Enter your event date</span>
        <input
          type="date"
          name="photoEventDate"
          placeholder="Please Enter Your Event Date"
          className="rounded h-10 text-white bg-stone-900 text-xl block px-4 py-1 my-4"
          {...register("photoEventDate", {
            required: "Your event date is required.",
          })}
        />
      </label>
      {errors.photoEventDate && (
        <p className="text-red-500">&uarr; {errors.photoEventDate.message}</p>
      )}
      <label
        htmlFor="photoEventTime"
        className="md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        <span>Enter your event time</span>
        <input
          type="time"
          name="photoEventTime"
          placeholder="Please Enter Your Event Time"
          className="h-10 text-white bg-stone-900 text-xl block px-4 py-1 my-4 focus:outline-none focus:ring-4 focus:ring-green-500 rounded-sm transition duration-150 ease-in-out"
          {...register("photoEventTime", {
            required: "Your event time is required.",
          })}
        />
      </label>
      {errors.photoEventTime && (
        <p className="text-red-500">&uarr; {errors.photoEventTime.message}</p>
      )}
      <label
        htmlFor="photoEventDescription"
        className="md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        Please describe your event
      </label>
      <textarea
        rows="10"
        name="photoEventDescription"
        className="block w-full md:text-xl my-4 p-2 bg-stone-900 focus:outline-none focus:ring-4 focus:ring-green-500 rounded-sm transition duration-150 ease-in-out "
        {...register("photoEventDescription", {
          required: "Your event description is required.",
        })}
      />
      {errors.videoEventDescription && (
        <p className="text-red-500">
          {" "}
          &uarr; {errors.videoEventDescription.message}
        </p>
      )}
    </div>
  );
};

/**
 * Step 4 (FLYER) of Media Request form
 * @returns JSX
 */
const Step4 = ({ step, register, errors }) => {
  return (
    <div className={`${step !== 4 && ` hidden `}`}>
      <h2 className="font-bold text-xl md:text-2xl text-center">
        Flyer Request
      </h2>
      <label
        htmlFor="flyerDescription"
        className="md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        Please describe your vision for the flyer (include special colors etc.)
      </label>
      <textarea
        rows="10"
        name="flyerDescription"
        className="block w-full md:text-xl my-4 p-2 bg-stone-900 focus:outline-none focus:ring-4 focus:ring-green-500 rounded-sm transition duration-150 ease-in-out "
        {...register("flyerDescription", {
          required: "Your event description is required.",
        })}
      />
      {errors.flyerDescription && (
        <p className="text-red-500">&uarr; {errors.flyerDescription.message}</p>
      )}
      <label
        htmlFor="flyerDeadline"
        className="block md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        <span>When do you need it by?</span>
        <input
          type="date"
          name="flyerDeadline"
          placeholder="Please Enter Your Event Date"
          className="rounded h-10 text-white bg-stone-900 text-xl block px-4 py-1 my-4"
          {...register("flyerDeadline", {
            required: "Your event date is required.",
          })}
        />
      </label>
      {errors.flyerDeadline && (
        <p className="text-red-500">&uarr; {errors.flyerDeadline.message}</p>
      )}
      <div className="flex flex-col space-y-4 md:text-lg lg:text-xl my-2 md:my-3 lg:my-4">
        <p>Would you like us to distribute the flyer?</p>
        <div>
          <input
            type="radio"
            id="flyerDistributionChoice1"
            name="flyerDistribution"
            value="no"
            className="ml-4 accent-green-500"
            {...register("flyerDistribution", {
              required: "An distribution choice is required.",
            })}
          />
          <label htmlFor="flyerDistributionChoice1" className="ml-4">
            No
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="flyerDistributionChoice2"
            name="flyerDistribution"
            value="yes"
            className="ml-4 accent-green-500"
            {...register("flyerDistribution", {
              required: "An distribution choice is required.",
            })}
          />
          <label htmlFor="flyerDistributionChoice2" className="ml-4">
            Yes
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * Step 5 (LOGO) of Media Request form
 * @returns JSX
 */
const Step5 = ({ step, register, errors }) => {
  return (
    <div className={`${step !== 5 && ` hidden `}`}>
      <h2 className="font-bold text-xl md:text-2xl text-center my-4">
        Logo Request
      </h2>
      <label
        htmlFor="logoDescription"
        className="md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        Please describe your vision and purpose for the logo <br />{" "}
        <span className="text-sm">(describe special design elements etc.)</span>
      </label>
      <textarea
        rows="10"
        name="logoDescription"
        className="block w-full md:text-xl my-4 p-2 bg-stone-900 focus:outline-none focus:ring-4 focus:ring-green-500 rounded-sm transition duration-150 ease-in-out "
        {...register("logoDescription", {
          required: "Your logo description is required.",
        })}
      />
      {errors.logoDescription && (
        <p className="text-red-500">&uarr; {errors.logoDescription.message}</p>
      )}
    </div>
  );
};
/**
 * Step 6 (Additional Information) of Media Request form
 * @param {object} props
 * @returns
 */
const Step6 = ({ step, register }) => {
  return (
    <div className={`${step !== 6 && ` hidden `}`}>
      <h2 className="font-bold text-xl md:text-2xl text-center my-4">
        Additional Information
      </h2>
      <label
        htmlFor="additionalInformation"
        className="md:text-lg lg:text-xl my-2 md:my-3 lg:my-4"
      >
        If your need was not listed or you have more information you would like
        us to know, please share it below:
      </label>
      <textarea
        rows="10"
        name="additionalInformation"
        className="block w-full md:text-xl my-4 p-2 bg-stone-900 focus:outline-none focus:ring-4 focus:ring-green-500 rounded-sm transition duration-150 ease-in-out "
        {...register("additionalInformation")}
      />
    </div>
  );
};
