import React, { useEffect, useState } from "react";
import chart from "../../assets/chart.svg";
import money from "../../assets/money.svg";
import lines from "../../assets/lines-for-background.svg";
import cards from "../../assets/cards.svg";
import incomesAndExpenses from "../../assets/incomes&expenses.png";
import sampleChart from "../../assets/sampleChart.png";
import categoryChartSample from "../../assets/categoryChartSample.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faCreditCard,
  faPercent,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { modalActions } from "../../store/modal-slice";
import LoginInfoModal from "../../components/modal/LoginInfoModal";
import { authActions } from "../../store/auth-slice";

const Home = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const version = useSelector((state) => state.modal.modalVersion);
  const [loginCounter, setLoginCounter] = useState(-1);
  const navigate = useNavigate();

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const handleLoginClickCounter = () => {
    setLoginCounter((prev) => prev + 1);
    dispatch(modalActions.loginInfoModal());
  };

  if (loginCounter > 7) {
    localStorage.removeItem("bg");
    localStorage.removeItem("token");
    dispatch(authActions.logout());
    navigate("/login");
    setLoginCounter(-1);
  }

  return (
    <>
      <LoginInfoModal loginCounter={loginCounter} version={version} />
      <header className="w-full h-screen overflow-x-hidden">
        <img
          src={cards}
          alt=""
          className="absolute top-10 z-20 w-8/12 left-1/3 xsm:w-6/12 xsm:left-1/2 sm:w-5/12 sm:left-[calc(100%-41.666667%)] md:w-4/12 md:left-2/3 lg:top-0 lg:left2/3"
        />
        <img
          src={chart}
          alt="chart without any points"
          className="h-32 sm:h-40 lg:h-48 w-full relative z-10"
        />
        <img
          src={money}
          alt="coins stacked on top of each other"
          className="w-48 sm:w-56 lg:w-64 m-10 relative sm:left-10 lg:left-20 z-10"
        />
        <img
          src={lines}
          alt=""
          className="absolute left-0 bottom-0 w-3/4 sm:w-7/12 lg:w-5/12"
        />
        <h1 className="text-white text-3xl text-center font-bold mx-5 my-12 xsm:mt-20 relative sm:my-10 sm:text-4xl">
          Take Control of Your Finances
        </h1>
        <p className="text-white text-base sm:text-lg mx-7 text-center relative">
          Gain control of your money and track your expenses and incomes
        </p>
        <button
          onClick={handleScroll}
          className="border-0 flex justify-center items-center bg-secondColor w-12 h-12  sm:w-14 sm:h-14 rounded-full absolute top-[calc(100%-90px)] left-[calc(50%-1.75rem)]"
        >
          <FontAwesomeIcon
            icon={faArrowDown}
            className="text-white text-2xl sm:text-3x1"
          />
        </button>
      </header>

      <main className="overflow-hidden">
        <div className="w-full bg-main">
          <div className="w-full xlg:w-4/5 flex flex-col xlg:flex-row text-white mx-auto py-12">
            <div className="md:w-4/5 xlg:w-full flex flex-col order-2 xlg:order-1 items-center xlg:items-start mx-auto">
              <h2
                data-h2="imgTitle2"
                className="text-3xl lg:text-4xl xlg:text-5xl mt-12 ml-8 font-semibold"
              >
                Charts
              </h2>
              <p className="w-[95%] px-8 xlg:px-0 xlg:ml-8 xlg:w-4/5 mt-12 lg:text-xl xlg:text-2xl">
                Use charts that are a graphical representation of your data
                values, making it easier to see in which days, months or years
                you earned or spent the most or the least
              </p>
            </div>
            <img
              src={sampleChart}
              alt="list of added expenses and incomes"
              className="sm:w-4/5 md:w-3/5 lg:w-1/2 mx-auto order-1"
            />
          </div>
          <div className="w-full xlg:w-4/5 flex flex-col xlg:flex-row text-white mx-auto py-12">
            <div className="md:w-4/5 xlg:w-full flex flex-col order-2 items-center xlg:items-end mx-auto">
              <h2
                data-h2="imgTitle3"
                className="text-3xl lg:text-4xl xlg:text-5xl mt-12 pb-12 ml-8 xlg:mr-8 font-semibold"
              >
                Categories
              </h2>
              <p className="w-[95%] px-8 xlg:px-0 xlg:ml-8 xlg:w-4/5 lg:text-xl xlg:text-2xl">
                View your data by category to see where you receive the most
                income, and also see what types of expenses you spend the most
                on to see if you have the opportunity to save additional funds
              </p>
            </div>
            <img
              src={categoryChartSample}
              alt="list of added expenses and incomes"
              className="sm:w-4/5 md:w-3/5 lg:w-1/2 mx-auto order-1"
            />
          </div>
          <div className="w-full xlg:w-4/5 flex flex-col xlg:flex-row text-white mx-auto py-12">
            <div className="md:w-4/5 xlg:w-full flex flex-col order-2 xlg:order-1 items-center xlg:items-start mx-auto">
              <h2
                data-h2="imgTitle"
                className="text-3xl lg:text-4xl xlg:text-5xl mt-12 ml-8 font-semibold"
              >
                Incomes and expenses
              </h2>
              <p className="w-[95%] px-8 xlg:px-0 xlg:ml-8 xlg:w-4/5 mt-12 lg:text-xl xlg:text-2xl">
                Add your income and expenses to your transactions, provide the
                title, value, date on which the transaction took place, category
                to which the transaction can be classified and description. Keep
                your data in one place for easy and quick access to your
                transactions
              </p>
            </div>
            <img
              src={incomesAndExpenses}
              alt="list of added expenses and incomes"
              className="sm:w-4/5 md:w-3/5 lg:w-1/2 mx-auto order-1"
            />
          </div>
        </div>

        <div className="bg-thirdColor h-quto">
          <h3 className="text-white text-center pt-20 pb-8 text-3xl">
            Additional features
          </h3>

          <div className=" w-full flex justify-center py-12">
            <ul className="w-4/5 flex items-center justify-center flex-wrap gap-8 text-white">
              <li
                data-li="feature"
                className="w-[95%] sm:w-4/5 md:w-3/5 lg:w-2/5 xlg:w-1/4 min-h-80 rounded-3xl flex flex-col items-center gap-4"
              >
                <span className="border-2 border-[rgb(255,255,0)] w-12 h-12 flex items-center justify-center text-2xl mt-8">
                  <FontAwesomeIcon icon={faCreditCard} />
                </span>
                <h5 data-h5="featureTitle" className="text-2xl font-semibold">
                  Dashboard
                </h5>
                <p className="px-4 text-center mt-4">
                  See the most important data about your transactions in one
                  place and the latest changes
                </p>
              </li>
              <li
                data-li="feature2"
                className="w-[95%] sm:w-4/5 md:w-3/5 lg:w-2/5 xlg:w-1/4 min-h-80 rounded-3xl flex flex-col items-center gap-4"
              >
                <span className="border-2 border-secondColor w-12 h-12 flex items-center justify-center text-2xl mt-8">
                  <FontAwesomeIcon icon={faPercent} />
                </span>
                <h5 data-h5="featureTitle2" className="text-2xl font-semibold">
                  Percentage
                </h5>
                <p className="px-4 text-center mt-4">
                  see how much more you earned or lost compared to the previous
                  month
                </p>
              </li>
              <li
                data-li="feature3"
                className="w-[95%] sm:w-4/5 md:w-3/5 lg:w-2/5 xlg:w-1/4 min-h-80 rounded-3xl flex flex-col items-center gap-4"
              >
                <span className="border-2 border-[rgb(128,0,128)] w-12 h-12 flex items-center justify-center text-2xl mt-8">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <h5 data-h5="featureTitle3" className="text-2xl font-semibold">
                  Search
                </h5>
                <p className="px-4 text-center mt-4">
                  Search for your income or expense by title to get information
                  about your transaction
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-neutral-900 pb-12 text-white w-full">
          <p className="text-center text-white text-3xl py-12">How to start?</p>
          <div className="w-4/5 flex flex-col xlg:flex-row gap-4 mx-auto">
            <div className="flex flex-col w-[95%] mx-auto gap-4 bg-main rounded-3xl p-4">
              <span className="text-lg font-semibold text-orange-600 px-4 mt-4">
                1. Login
              </span>
              <p className="p-4">
                Log in to the household account by filling
                out the form and providing the data you will use when using the
                application
              </p>
            </div>
            <div className="flex flex-col w-[95%] mx-auto gap-4 bg-main rounded-3xl p-4">
              <span className="text-lg font-semibold text-orange-600 px-4 mt-4">
                2. Add your income or expense
              </span>
              <p className="p-4">
                Go to the income or expense tab and add a transaction by filling
                out the form
              </p>
            </div>
            <div className="flex flex-col w-[95%] mx-auto gap-4 bg-main rounded-3xl p-4">
              <span className="text-lg font-semibold text-orange-600 px-4 mt-4">
                3. Check charts
              </span>
              <p className="p-4">
                Observe charts in different places, show values for all years -{" "}
                <span className="text-secondColor font-semibold">Yearly</span>,
                for months in a given year -{" "}
                <span className="text-secondColor font-semibold">Monthly</span>,
                or for weeks in a given month -{" "}
                <span className="text-secondColor font-semibold">Weekly</span>
              </p>
            </div>
            <div className="flex flex-col w-[95%] mx-auto gap-4 bg-main rounded-3xl p-4">
              <span className="text-lg font-semibold text-orange-600 px-4 mt-4">
                4. Check, change or delete data
              </span>
              <p className="p-4">
                Check the information about the data you have entered, delete
                unnecessary data or change it as you wish
              </p>
            </div>
          </div>
        </div>
      </main>
      <p className="text-center text-white text-3xl py-12 bg-thirdColor">
        Let's get started!{" "}
        {isAuthenticated ? (
          <button
            onClick={handleLoginClickCounter}
            className="text-orange-600 hover:text-orange-800 transition-all duration-300"
          >
            Login
          </button>
        ) : (
          <Link
            className="text-orange-600 hover:text-orange-800 transition-all duration-300"
            to={"login"}
          >
            Login
          </Link>
        )}
      </p>
      <footer className="bg-thirdColor border-t-2 border-neutral-700 pb-12">
        <h4 className="text-white text-center pt-12 font-semibold text-2xl">
          Contact us via social media
        </h4>

        <div className="w-full xlg:w-1/2 flex flex-col sm:flex-row gap-8 mx-auto justify-around md:justify-center text-white mt-8">
          <div className="flex flex-col items-start gap-4 ml-16 sm:ml-0">
            <span className="text-orange-600 text-xl">Frontend</span>
            <Link
              to="https://github.com/Effencee"
              target="_blank"
              className="flex gap-2 items-center"
            >
              <FontAwesomeIcon icon={faGithub} className="text-2xl" />
              <span className="text-xl">Effencee</span>
            </Link>
          </div>

          <div className="flex flex-col items-start gap-4 md:translate-x-1/3 xlg:translate-x-2/3 ml-16 sm:ml-0">
            <span className="text-orange-600 text-xl">Backend</span>
            <Link
              to="https://github.com/rodis00"
              target="_blank"
              className="flex gap-2 items-center"
            >
              <FontAwesomeIcon icon={faGithub} className="text-2xl" />
              <span className="text-xl">rodis00</span>
            </Link>
            <Link
              to="https://www.linkedin.com/in/adrian-sidor-924013284/"
              target="_blank"
              className="flex gap-2 items-center"
            >
              <FontAwesomeIcon icon={faLinkedin} className="text-2xl" />
              <span className="text-xl">adrian-sidor-924013284</span>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
