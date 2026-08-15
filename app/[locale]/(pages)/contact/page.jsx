"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function Contact() {
  const t = useTranslations("Contact");

  const [send, setSend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://formspree.io/f/xppajpdo",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        form.reset();
        setSend(true);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Success alert
  if (send) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900/70" />

        {/* Modal */}
        <div
          className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="text-center px-6 py-12 sm:px-10">
            <h2
              id="modal-headline"
              className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            >
              <span className="block">
                {t("messageSent")}
              </span>

              <span className="block mt-2 text-primary">
                {t("reply")}
              </span>
            </h2>

            <div className="mt-10">
              <button
                type="button"
                onClick={() => setSend(false)}
                className="
                  py-3
                  px-8
                  bg-primary
                  hover:bg-dark
                  text-white
                  transition
                  duration-200
                  text-base
                  font-semibold
                  shadow-md
                  rounded-lg
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary
                  focus:ring-offset-2
                "
              >
                {t("ok")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="contact"
      className="py-20 md:py-[120px] relative"
    >
      <div
        className="
          absolute
          z-[-1]
          w-full
          h-1/2
          lg:h-[45%]
          xl:h-1/2
          bg-[#f3f4fe]
          top-0
          left-0
        "
      />

      <div className="container px-4">
        <div className="flex flex-wrap items-center -mx-4">

          {/* Contact information */}
          <div className="px-4 w-full lg:w-7/12 xl:w-8/12">
            <div className="ud-contact-content-wrapper">

              <div className="ud-contact-title mb-12 lg:mb-[150px]">
                <span className="text-dark font-semibold text-base mb-5">
                  {t("contactUs")}
                </span>

                <h2 className="text-[35px] font-semibold"></h2>
              </div>

              <div className="flex flex-wrap justify-between mb-12 lg:mb-0">

                {/* Location */}
                <div className="flex max-w-full w-[330px] mb-8">
                  <div className="text-[32px] text-primary mr-6">
                    <svg
                      width="29"
                      height="35"
                      viewBox="0 0 29 35"
                      className="fill-current"
                    >
                      <path d="M14.5 0.710938C6.89844 0.710938 0.664062 6.72656 0.664062 14.0547C0.664062 19.9062 9.03125 29.5859 12.6406 33.5234C13.1328 34.0703 13.7891 34.3437 14.5 34.3437C15.2109 34.3437 15.8672 34.0703 16.3594 33.5234C19.9688 29.6406 28.3359 19.9062 28.3359 14.0547C28.3359 6.67188 22.1016 0.710938 14.5 0.710938ZM14.9375 32.2109C14.6641 32.4844 14.2812 32.4844 14.0625 32.2109C11.3828 29.3125 2.57812 19.3594 2.57812 14.0547C2.57812 7.71094 7.9375 2.625 14.5 2.625C21.0625 2.625 26.4219 7.76562 26.4219 14.0547C26.4219 19.3594 17.6172 29.2578 14.9375 32.2109Z" />
                      <path d="M14.5 8.58594C11.2734 8.58594 8.59375 11.2109 8.59375 14.4922C8.59375 17.7188 11.2187 20.3984 14.5 20.3984C17.7812 20.3984 20.4062 17.7734 20.4062 14.4922C20.4062 11.2109 17.7266 8.58594 14.5 8.58594ZM14.5 18.4297C12.3125 18.4297 10.5078 16.625 10.5078 14.4375C10.5078 12.25 12.3125 10.4453 14.5 10.4453C16.6875 10.4453 18.4922 12.25 18.4922 14.4375C18.4922 16.625 16.6875 18.4297 14.5 18.4297Z" />
                    </svg>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold mb-6">
                      {t("ourLocation")}
                    </h5>

                    <p className="text-base text-body-color">
                      {t("location")}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex max-w-full w-[330px] mb-8">
                  <div className="text-[32px] text-primary mr-6">
                    <svg
                      width="34"
                      height="25"
                      viewBox="0 0 34 25"
                      className="fill-current"
                    >
                      <path d="M30.5156 0.960938H3.17188C1.42188 0.960938 0 2.38281 0 4.13281V20.9219C0 22.6719 1.42188 24.0938 3.17188 24.0938H30.5156C32.2656 24.0938 33.6875 22.6719 33.6875 20.9219V4.13281C33.6875 2.38281 32.2656 0.960938 30.5156 0.960938ZM30.5156 2.875C30.7891 2.875 31.0078 2.92969 31.2266 3.09375L17.6094 11.3516C17.1172 11.625 16.5703 11.625 16.0781 11.3516L2.46094 3.09375C2.67969 2.98438 2.89844 2.875 3.17188 2.875H30.5156ZM30.5156 22.125H3.17188C2.51562 22.125 1.91406 21.5781 1.91406 20.8672V5.00781L15.0391 12.9922C15.5859 13.3203 16.1875 13.4844 16.7891 13.4844C17.3906 13.4844 17.9922 13.3203 18.5391 12.9922L31.6641 5.00781V20.8672C31.7734 21.5781 31.1719 22.125 30.5156 22.125Z" />
                    </svg>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold mb-6">
                      {t("howCanWeHelp")}
                    </h5>

                    <p className="text-base text-body-color">
                      Sidalirazali11@gmail.com
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="px-4 w-full lg:w-5/12 xl:w-4/12">
            <div
              className="
                shadow-testimonial
                rounded-lg
                bg-white
                py-10
                px-8
                md:p-[60px]
                lg:p-10
                2xl:p-[60px]
                sm:py-12 sm:px-10
                lg:py-12 lg:px-10
              "
            >
              <h3 className="font-semibold mb-8 text-2xl md:text-[26px]">
                {t("contactForm")}
              </h3>

              <form onSubmit={handleSubmit}>

                {/* Full name */}
                <div className="mb-6">
                  <label
                    htmlFor="fullName"
                    className="block text-xs text-dark"
                  >
                    {t("fullName")}*
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder={t("fullNamePlaceholder")}
                    required
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                    "
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-xs text-dark"
                  >
                    {t("email")}*
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t("emailPlaceholder")}
                    required
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                    "
                  />
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label
                    htmlFor="phone"
                    className="block text-xs text-dark"
                  >
                    {t("phone")}*
                  </label>

                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    placeholder={t("phonePlaceholder")}
                    required
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                    "
                  />
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-xs text-dark"
                  >
                    {t("message")}*
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="3"
                    placeholder={t("messagePlaceholder")}
                    required
                    className="
                      w-full
                      border-0 border-b border-[#f1f1f1]
                      focus:border-primary focus:outline-none
                      py-4
                      resize-none
                    "
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {t("error")}
                  </div>
                )}

                {/* Submit */}
                <div className="mb-0">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      py-4
                      px-6
                      rounded
                      text-white
                      bg-primary
                      text-base
                      font-medium
                      hover:bg-dark
                      transition
                      duration-300
                      ease-in-out
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {isLoading ? t("sending") : t("sendMessage")}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Contact;