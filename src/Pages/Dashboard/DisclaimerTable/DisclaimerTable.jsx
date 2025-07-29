import style from "./DisclaimerTable.module.scss";
import { useState, useEffect } from "react";
// Mui
import LinearProgress from "@mui/material/LinearProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import Divider from "@mui/material/Divider";
//
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// Toastify
import { toast } from "react-toastify";
// API
import useGetAllDisclaimersApi from "../../../API/useGetAllDisclaimersApi";
import useGetOneDisclaimerApi from "../../../API/useGetOneDisclaimerApi";
import { useDeleteDisclaimerApi } from "../../../API/useDeleteDisclaimerApi";
// Cookies
import { useCookies } from "react-cookie";

export default function DisclaimerTable() {
  // Cookies
  const [cookies, setCookie] = useCookies(["role"]);
  //
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //
  const { data, isPending: isGetAllDisclaimersPending } =
    useGetAllDisclaimersApi();
  //
  const {
    mutate: mutateDeleteDisclaimer,
    isPending: isDeleteDisclaimerPending,
  } = useDeleteDisclaimerApi();

  //
  const [deletingId, setDeletingId] = useState(null); // Track which report is being deleted

  // Handle delete report
  const handleDeleteDisclaimer = (id) => {
    if (window.confirm("Are you sure you want to delete this Disclaimer?")) {
      setDeletingId(id); // Set the ID of the report being deleted
      mutateDeleteDisclaimer(id, {
        onSuccess: () => {
          toast.success("Deleted successfully!");
        },
        onSettled: () => {
          setDeletingId(null); // Reset deleting ID when operation completes
        },
      });
    }
  };

  //
  const [disclaimerId, setDisclaimerId] = useState(null); // Track which report is being deleted
  //
  const {
    refetch: fetchOneDisclaimer,
    data: OneDisclaimerData,
    isPending: isGetOneDisclaimerPending,
    isSuccess: isGetOneDisclaimersSuccess,
  } = useGetOneDisclaimerApi(disclaimerId);

  // Handle Download Disclaimer
  const handleDownloadDisclaimerData = async (id) => {
    await setDisclaimerId(id); // Set the ID of the report being deleted
    fetchOneDisclaimer();
  };

  //   useEffect(() => {
  //     if (isGetOneDisclaimersSuccess) {
  //       setDisclaimerId(null);
  //     }
  //   }, [isGetOneDisclaimersSuccess]);

  //

  const generatePDF = async (data) => {
    try {
      const {
        plate_letter1,
        plate_letter2,
        plate_letter3,
        plate_number,
        car_type,
        report_number,
        name,
        created_at,
        signature_base64,
      } = data;

      // Format the date
      const dateObj = new Date(created_at);
      const formattedDate = `${dateObj.getFullYear()}/${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`;

      // Create a temporary div for PDF content
      const pdfContent = document.createElement("div");
      pdfContent.style.cssText = `
      direction: rtl;
      text-align: right;
      font-family: 'Arial', sans-serif;
      padding: 30px;
      background: white;
      width: 800px;
      font-size: 14px;
      line-height: 1.6;
    `;

      pdfContent.innerHTML = `
      <h1 style="text-align: center; font-size: 18px; margin-top: 32px; margin-bottom: 32px; font-weight: bold;">
        نموذج إقرار وإخلاء مسؤولية عن التجربة الميدانية للمركبة
      </h1>

      <p style="margin-bottom: 15px;">
        أقر أنا الموقع أدناه بأني مالك أو المفوض على المركبة ذات البيانات التالية:
      </p>

      <p style="margin-bottom: 15px; font-weight: bold;">
        رقم اللوحة:
      </p>

      <div style="display: flex; margin-bottom: 15px; border: 1px solid #000;">
        <div style="flex: 1; padding: 10px; text-align: center; border-left: 1px solid #000;">${plate_letter1}</div>
        <div style="flex: 1; padding: 10px; text-align: center; border-left: 1px solid #000;">${plate_letter2}</div>
        <div style="flex: 1; padding: 10px; text-align: center; border-left: 1px solid #000;">${plate_letter3}</div>
        <div style="flex: 1; padding: 10px; text-align: center;">${plate_number}</div>
      </div>

      <p style="margin-bottom: 8px;"><span style="font-weight: bold;">نوع السيارة:</span> ${car_type}</p>
      <p style="margin-bottom: 15px;"><span style="font-weight: bold;">رقم التقرير:</span> ${report_number}</p>

      <p style="margin-bottom: 15px;">
        وقد تم إبلاغي من قبل (مؤسسة كاشف التجارية) بأن حالة المركبة قد لا تكون مناسبة فنياً للتجربة الميدانية، وأنه قد يترتب على ذلك أعطال فنية خلال أو بعد التجربة.
      </p>

      <p style="margin-bottom: 24px;">
        وبناء عليه، أوافق على إجراء التجربة الميدانية على مسؤوليتي الشخصية، وأخلي طرف المؤسسة وفنييها من أي مسؤولية عن أي أعطال أو أضرار قد تنتج عن هذه التجربة.
      </p>


      <div style="display: flex; justify-content: space-between;">
        <div>
          <p style="margin-bottom: 8px;"><span style="font-weight: bold;">الاسم:</span> ${name}</p>
          <p style="margin-bottom: 20px;"><span style="font-weight: bold;">التاريخ:</span> ${formattedDate}</p>
        </div>

        <div>
            <p style="font-weight: bold; margin-bottom: 5px;">التوقيع:</p>
            ${
              signature_base64
                ? `<img src="${signature_base64}" style="max-width: 200px; max-height: 80px;" />`
                : ""
            }
        </div>
      </div>
    `;

      // Add to DOM temporarily
      document.body.appendChild(pdfContent);

      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Remove from DOM
      document.body.removeChild(pdfContent);

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`disclaimer_${report_number}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      throw error;
    }
  };

  // Then update the useEffect that handles isGetOneDisclaimersSuccess
  useEffect(() => {
    if (isGetOneDisclaimersSuccess && OneDisclaimerData) {
      generatePDF(OneDisclaimerData);
      setDisclaimerId(null);
    }
  }, [isGetOneDisclaimersSuccess, OneDisclaimerData]);

  return (
    <div className={style.container}>
      {isGetAllDisclaimersPending && (
        <div className={style.progressContainer}>
          <LinearProgress />
        </div>
      )}

      <p
        style={{
          marginTop: "12px",
          width: "fit-content",
          padding: "0 6px",
          borderRadius: "3px",
        }}
      >
        Disclaimers
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {data && (
        <div className={style.table_container} dir="ltr">
          <table>
            <thead>
              <tr>
                <th>Report Number</th>
                <th>Name</th>
                <th>Car model</th>
                <th style={{ whiteSpace: "nowrap" }}>Plate number</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.disclaimers?.map((disclaimer) => (
                <tr key={disclaimer.id}>
                  <td>{disclaimer.report_number}</td>
                  <td>{disclaimer.name}</td>
                  <td>{disclaimer.car_type}</td>
                  <td>
                    {disclaimer.plate_number} {disclaimer.plate_letter1}{" "}
                    {disclaimer.plate_letter2} {disclaimer.plate_letter3}
                  </td>

                  <td>
                    {new Date(disclaimer.created_at).toLocaleDateString(
                      "en-GB"
                    )}
                  </td>

                  <td
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      width: "100%",
                    }}
                  >
                    <LoadingButton
                      type="button"
                      fullWidth
                      variant="contained"
                      disableRipple
                      color="primary"
                      onClick={() =>
                        handleDownloadDisclaimerData(disclaimer.id)
                      }
                      loading={disclaimerId === disclaimer.id} // Only show loading for this specific button
                      disabled={
                        disclaimerId !== null && disclaimerId !== disclaimer.id
                      } // Disable other buttons while one is loading
                    >
                      Download
                    </LoadingButton>

                    {cookies.role === 255 && (
                      <LoadingButton
                        type="button"
                        fullWidth
                        variant="contained"
                        disableRipple
                        color="error"
                        onClick={() => handleDeleteDisclaimer(disclaimer.id)}
                        loading={deletingId === disclaimer.id} // Only show loading for this specific button
                        disabled={
                          deletingId !== null && deletingId !== disclaimer.id
                        } // Disable other buttons while one is loading
                      >
                        Delete
                      </LoadingButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
