import style from "./RefundTable.module.scss";
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
import useGetAllRefundClientsApi from "../../../API/useGetAllRefundClientsApi";
import useGetOneRefundClientApi from "../../../API/useGetOneRefundClientApi";
import { useDeleteRefundClientApi } from "../../../API/useDeleteRefundClientApi";
// Cookies
import { useCookies } from "react-cookie";

export default function RefundTable() {
  // Cookies
  const [cookies, setCookie] = useCookies(["role"]);
  //
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //
  const { data, isPending: isGetAllRefundClientsPending } =
    useGetAllRefundClientsApi();
  //
  const { mutate: mutateDelete } = useDeleteRefundClientApi();

  //
  const [deletingId, setDeletingId] = useState(null); // Track which report is being deleted

  // Handle delete report
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this refund?")) {
      setDeletingId(id); // Set the ID of the report being deleted
      mutateDelete(id, {
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
  const [clientId, setClientId] = useState(null); // Track which report is being deleted
  //
  const {
    refetch: fetchGetOneClient,
    data: OneRefundClientData,
    isSuccess: isGetOneclientSuccess,
  } = useGetOneRefundClientApi(clientId);

  // Handle Download
  const handleDownload = async (id) => {
    await setClientId(id); // Set the ID of the report being deleted
    fetchGetOneClient();
  };

  //   useEffect(() => {
  //     if (isGetOneclientSuccess) {
  //       setClientId(null);
  //     }
  //   }, [isGetOneclientSuccess]);

  //

  const generatePDF = async (data) => {
    try {
      const {
        report_number,
        amount,
        inspection_date,
        name,
        id_number,
        phone_number,
        bank_name,
        iban,
        signature_date,
        signature_base64,
      } = data;

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
        نموذج إقرار استلام وتعهد بالتنازل عن المطالبات
      </h1>

      <p style="margin-bottom: 15px;">
        أنا الموقع أدناه:
      </p>

      <div style="margin-bottom: 32px;">
          <div style="display: flex; text-align: center; width: 100%;">
            <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; font-weight: bold;" >الاسم</div>
            <div dir="rtl" style="text-align: center; border: 1px solid #000; flex: 3; padding: 6px;" >${name}</div>
          </div>
          <div style="display: flex; text-align: center; width: 100%;">
            <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >رقم الهوية/الإقامة</div>
            <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${id_number}</div>
          </div>
          <div style="display: flex; text-align: center; width: 100%;">
            <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >رقم الجوال</div>
            <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${phone_number}</div>
          </div>
          <div style="display: flex; text-align: center; width: 100%;">
            <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >رقم تقرير الفحص</div>
            <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${report_number}</div>
          </div>
          <div style="display: flex; text-align: center; width: 100%;">
            <div dir="rtl" style="border: 1px solid #000; border-left: none; padding: 6px; flex: 1; border-top: none; font-weight: bold;" >تاريخ الفحص</div>
            <div dir="ltr" style="text-align: center; border: 1px solid #000; flex: 3; border-top: none; padding: 6px;" >${
              inspection_date.split("T")[0]
            }</div>
          </div>
      </div>



        <p style="margin-bottom: 32px;">
أقر أنا الموقع أدناه بأنني اتفقت مع مؤسسة كاشف التجارية على استلام مبلغًا وقدره <span style="font-weight: bold;">(${amount})</span> ريال سعودي, وذلك كتعويض وتسوية عن عملية الفحص في التاريخ المشار إليها أعلاه، على ان يتم تحويلها على بنك <span style="font-weight: bold;">(${bank_name})</span>, حساب ايبان رقم: <span style="font-weight: bold;">(${iban})</span>
        </p>



        <p style="margin-bottom: 15px; font-weight: bold;">
          وبموجب هذا الإقرار:
        </p>

        <div dir="rtl" style="padding-right: 16px; margin-bottom: 32px">
              <p dir="rtl" style="margin-bottom: 12px; direction: rtl;">
                1- أؤكد أنني وافقت على استلام المبلغ المتفق عليه كاملًا، وأنه لا يحق لي
                المطالبة بأي مبالغ إضافية مستقبلًا تتعلق بهذا الخطأ.
              </p>

              <p dir="rtl" style="margin-bottom: 12px;">
                2- أتعهد بعدم إقامة أي دعاوى قضائية أو مطالبات مالية أو قانونية ضد
                مؤسسة كاشف التجارية أو من يمثلها، سواء الآن أو في المستقبل، فيما
                يخص هذا الموضوع.
              </p>
              <p dir="rtl" style="margin-bottom: 12px;">
                3- أعتبر هذا التعويض تسوية نهائية وكاملة، ولا يترتب عليه أي
                التزامات أخرى على مؤسسة كاشف التجارية.
              </p>
              <p dir="rtl">
                4- اقر بعدم الإشارة والتعليق على هذا الموضوع في مواقع التواصل
                الاجتماعي سواءً بالتلميح او التصريح.
              </p>
        </div>


      <div style="display: flex; justify-content: space-between;">
        <div>
          <p style="margin-bottom: 20px;"><span style="font-weight: bold;">حرر هذا الإقرار بتاريخ: </span> <span dir="ltr">${
            signature_date.split("T")[0]
          }</span></p>
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

      pdf.save(`refund_${report_number}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      throw error;
    }
  };

  // Then update the useEffect that handles isGetOneclientSuccess
  useEffect(() => {
    if (isGetOneclientSuccess && OneRefundClientData) {
      generatePDF(OneRefundClientData);
      setClientId(null);
    }
  }, [isGetOneclientSuccess, OneRefundClientData]);

  return (
    <div className={style.container}>
      {isGetAllRefundClientsPending && (
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
        Refund Clients
      </p>
      <Divider sx={{ marginBottom: "32px" }} />

      {data && (
        <div className={style.table_container} dir="ltr">
          <table>
            <thead>
              <tr>
                <th>Report Number</th>
                <th>Name</th>
                <th>Date</th>
                <th>URL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.refundClients?.map((client) => (
                <tr key={client.id}>
                  <td>{client.report_number}</td>
                  <td>{client.name || "-"}</td>

                  <td>
                    {client.signature_date
                      ? new Date(client.signature_date).toLocaleDateString(
                          "en-GB"
                        )
                      : "-"}
                  </td>

                  <td>{client.url}</td>

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
                      onClick={() => handleDownload(client.id)}
                      loading={clientId === client.id} // Only show loading for this specific button
                      disabled={
                        (clientId !== null && clientId !== client.id) ||
                        !client.signature
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
                        onClick={() => handleDelete(client.id)}
                        loading={deletingId === client.id} // Only show loading for this specific button
                        disabled={
                          deletingId !== null && deletingId !== client.id
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
