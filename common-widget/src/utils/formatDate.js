export default function formatDate(datetime, format) {
  if (datetime == "" || datetime == undefined) {
    return "-";
  }
  let dateLocale = {
    month_names: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    month_names_short: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };
  let date = new Date(datetime);
  let month_short = dateLocale.month_names_short[date.getMonth()];
  let month_long = dateLocale.month_names[date.getMonth()];
  let week_day = dateLocale.days[date.getDay()];
  let monthData = date.getMonth() + 1;
  let yr = date.getFullYear();
  let month = monthData < 10 ? "0" + monthData : monthData;
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let newDate = "";
  var hours = date.getHours(); // gives the value in 24 hours format
  var AmOrPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  var minutes = date.getMinutes();
  minutes = minutes < 10 ? `0${parseInt(minutes)}` : minutes;

  if (format == "d-m-Y") {
    newDate = `${day}-${month}-${yr}`;
  } else if (format == "d sm Y") {
    newDate = `${day} ${month_short} ${yr}`;
  } else if (format == "d/sm/Y") {
    newDate = `${day}/${month_short}/${yr}`;
  } else if (format == "d lm Y") {
    newDate = `${day} ${month_long} ${yr}`;
  } else if (format == "Y-m-d") {
    newDate = `${yr}-${month}-${day}`;
  } else if (format == "Y-m") {
    newDate = `${yr}-${month}`;
  } else if (format == "Y") {
    newDate = `${yr}`;
  } else if (format == "M") {
    newDate = `${month}`;
  } else if (format == "d lm") {
    newDate = `${day} ${month_long}`;
  } else if (format == "d sm") {
    newDate = `${day} ${month_short}`;
  } else if (format == "d/m/Y") {
    newDate = `${day}/${month}/${yr}`;
  } else if (format == "sm Y") {
    newDate = `${month_short} ${yr}`;
  } else if (format == "sm") {
    newDate = `${month_short}`;
  } else if (format == "sm d, Y h:m") {
    newDate = `${month_short} ${day}, ${yr} ${hours}:${minutes} ${AmOrPm}`;
  } else if (format == "d w") {
    newDate = `${day} ${week_day}`;
  } else if (format == "d M w") {
    newDate = `${day} ${month_short} ${week_day}`;
  } else if (format == "d M") {
    newDate = `${day} ${month_short}`;
  } else if (format == "w") {
    newDate = `${week_day}`;
  } else {
    newDate = yr + "-" + month + "-" + day;
  }
  return newDate;
}
