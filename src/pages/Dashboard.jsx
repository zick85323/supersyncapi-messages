import { Divider, Button } from "@mui/material";
import React, { useState } from "react";
import AppButton from "../component/Basic/AppButton";
import AppText from "../component/Basic/AppText";
import AppInput from "../component/Basic/AppInput";
import Paper from "@mui/material/Paper";
import styled from "styled-components";
import AppList from "../component/AppList";
import useDeviceDetect from "../hooks/useDeviceDetect";
import Papa from "papaparse";

const Dashboard = () => {
  const [list, setList] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWhatsappInstalled, setIsWhatsappInstalled] = useState(false);
  const [report, setReport] = useState([]);
  const [processing, setProcessing] = useState(false);

  const device = useDeviceDetect();

  React.useEffect(() => {
    const searchedList = window.localStorage.getItem("SearchedList");
    if (searchedList) {
      setList(JSON.parse(searchedList));
    }
    if (device === "mobile") {
      setIsMobile(true);
      setIsWhatsappInstalled(true);
    } else {
      setIsMobile(false);
      setIsWhatsappInstalled(isWhatsappWebInstalled());
    }
  }, [device]);

  const handlePasteInput = async () => {
    const text = await navigator.clipboard.readText();
    setMobileNumber(text);
    setError(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: function (results) {
        setList(results.data);
      },
    });
  };

  const isWhatsappWebInstalled = () => {
    try {
      const whatsappUrl = "https://web.whatsapp.com/";
      const request = new XMLHttpRequest();
      request.open("GET", whatsappUrl, false);
      request.send(null);
      return request.status === 200;
    } catch (error) {
      return false;
    }
  };

  const sendMessages = async (contacts) => {
    setProcessing(true);
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      for (let j = 0; j < contacts[i].length; j++) {
        const contact = contacts[i][j];
        if (!contact) continue;

        const sendMessageUrl = `https://wa.me/${contact}?text=${encodeURIComponent(
          message
        )}`;

        try {
          const newWindow = window.open(sendMessageUrl, "_blank");

          // Wait for WhatsApp to open
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Close the WhatsApp window
          if (newWindow) {
            newWindow.close();
          }

          successCount++;
          setReport((prevReport) => [
            ...prevReport,
            { contact, status: "Success" },
          ]);
        } catch (error) {
          failureCount++;
          setReport((prevReport) => [
            ...prevReport,
            { contact, status: "Failed" },
          ]);
        }

        // Wait a little before processing the next contact
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setProcessing(false);
    alert(`Messages processed. Success: ${successCount}, Failed: ${failureCount}`);
  };

  const handleSubmit = () => {
    if (isWhatsappInstalled) {
      sendMessages(list);
      setMobileNumber("");
    } else {
      alert("WhatsApp is not installed or accessible on this device.");
    }
  };

  return (
    <DashboardContainer>
      <MainHeading>
        <AppText
          variant="h5"
          content="Send Whatsapp Message Without Saving Number On Your Device"
        />
      </MainHeading>
      <MainContainer>
        <SubHeadingContainer>
          <AppText variant="button" content="Enter number with country code" />
        </SubHeadingContainer>
        <AppInput
          onChange={(e) => setMobileNumber(e.target.value)}
          onClick={handlePasteInput}
          value={mobileNumber}
          error={error}
        />
        <AppInput
          id="message-input"
          label="Enter Message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ margin: "1rem 0" }}
        />
        {!isMobile && (
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <input
                type="checkbox"
                checked={isWhatsappInstalled}
                onChange={(e) => setIsWhatsappInstalled(e.target.checked)}
              />
              Is WhatsApp installed on your device?
            </label>
          </div>
        )}
        <AppButton
          onClick={handleSubmit}
          title="Send Message"
          disabled={processing || list.length === 0 || !message}
        />
      </MainContainer>
      <AppList
        list={list}
        onClick={(id) => {
          const newList = list.filter((item) => item.id !== id);
          setList(newList);
          window.localStorage.setItem("SearchedList", JSON.stringify(newList));
        }}
        onClear={() => {
          setList([]);
          window.localStorage.removeItem("SearchedList");
        }}
        isMobile={isMobile}
        isWhatsappInstalled={isWhatsappInstalled}
      />
      {report.length > 0 && (
        <ReportContainer>
          <AppText variant="h6" content="Send Report" />
          <ul>
            {report.map((item, index) => (
              <li key={index}>
                {item.contact} - {item.status}
              </li>
            ))}
          </ul>
        </ReportContainer>
      )}
    </DashboardContainer>
  );
};

const DashboardContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const MainHeading = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  text-align: center;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const SubHeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ReportContainer = styled.div`
  margin-top: 2rem;
`;

export default Dashboard;
