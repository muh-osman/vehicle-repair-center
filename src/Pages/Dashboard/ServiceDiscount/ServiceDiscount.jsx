import { useEffect, useState } from "react";
import style from "./ServiceDiscount.module.scss";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import EditIcon from "@mui/icons-material/Edit";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import API from "../../../API/Api"; // adjust path as needed

// ── helpers for datetime-local <-> ISO conversion ─────────
// datetime-local input needs "YYYY-MM-DDTHH:mm" in LOCAL time (no timezone)
const toDatetimeLocalValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatExpiry = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ServiceDiscount() {
  const getMinDateTime = () => {
    const now = new Date();
    now.setSeconds(0, 0); // datetime-local ignores seconds

    const pad = (n) => String(n).padStart(2, "0");

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  //
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null); // whole row object, or null when modal closed
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // ── fetch ──────────────────────────────────────────────
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await API.get("api/service-discounts");
      setRows(res.data);
    } catch {
      showToast("فشل تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── modal helpers ───────────────────────────────────────
  const openEdit = (row) => {
    setEditingRow(row);
    setEditForm({
      discount_value: String(row.discount_value), // string, not number
      discount_unit: row.discount_unit,
      is_active: row.is_active,
      expires_at: toDatetimeLocalValue(row.expires_at),
    });
  };

  const closeEdit = () => {
    if (saving) return;
    setEditingRow(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingRow) return;
    const id = editingRow.id;
    const discountValue = Number(editForm.discount_value);

    if (editForm.discount_value === "" || Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      showToast("يجب أن تكون قيمة الخصم بين 0 و 100", "error");
      return;
    }

    if (editForm.expires_at) {
      const chosen = new Date(editForm.expires_at);
      if (chosen.getTime() <= Date.now()) {
        showToast("يجب أن يكون تاريخ الانتهاء في المستقبل", "error");
        return;
      }
    }

    try {
      setSaving(true);

      const res = await API.put(`api/service-discounts/${id}`, {
        ...editForm,
        discount_value: discountValue,
        // send null explicitly if cleared, otherwise ISO string
        expires_at: editForm.expires_at ? new Date(editForm.expires_at).toISOString() : null,
      });

      setRows((prev) => prev.map((r) => (r.id === id ? res.data : r)));

      showToast("تم الحفظ بنجاح", "success");
      setEditingRow(null);
      setEditForm({});
    } catch {
      showToast("فشل الحفظ، حاول مرة أخرى", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, severity) => setToast({ open: true, message, severity });

  // ── render ─────────────────────────────────────────────
  return (
    <div className={style.container} dir="rtl">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          إدارة خصومات الباقات
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          تعديل نسبة الخصم لكل باقة
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table
            sx={{
              tableLayout: "fixed",
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  الباقة
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  الخصم
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  تاريخ الانتهاء
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  إجراءات
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => {
                const expiryLabel = formatExpiry(row.expires_at);

                return (
                  <TableRow key={row.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    {/* Service name */}
                    <TableCell align="right">
                      <Typography fontWeight={600}>{row.service_name_ar}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {row.service_id}
                      </Typography>
                    </TableCell>

                    {/* Discount value */}
                    <TableCell align="center">
                      <Chip
                        label={`${row.discount_value} ${row.discount_unit}`}
                        color={row.discount_value > 0 && row.is_active ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    {/* Expires at */}
                    <TableCell align="center">
                      {expiryLabel ? (
                        <Tooltip title="سيتم إرجاع الخصم للافتراضي بعد هذا التاريخ">
                          <Chip
                            label={expiryLabel}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{
                              "& .MuiChip-label": {
                                fontSize: "0.7rem",
                                padding: "0 6px",
                                whiteSpace: "nowrap", // Keep on one line
                              },
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="بدون تاريخ انتهاء">
                          <AllInclusiveIcon color="disabled" fontSize="small" sx={{ verticalAlign: "middle" }} />
                        </Tooltip>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Tooltip title="تعديل">
                        <IconButton onClick={() => openEdit(row)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Modal */}
      <Dialog open={Boolean(editingRow)} onClose={closeEdit} fullWidth maxWidth="xs" dir="rtl">
        <DialogTitle sx={{ fontWeight: 700 }}>
          تعديل خصم
          {editingRow ? ` — ${editingRow.service_name_ar}` : ""}
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 3 }}>
          <TextField
            label="قيمة الخصم"
            dir="ltr"
            type="number"
            fullWidth
            value={editForm.discount_value ?? ""}
            onChange={(e) => setEditForm((f) => ({ ...f, discount_value: e.target.value }))}
            InputProps={{
              endAdornment: editForm.discount_unit ? (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {editForm.discount_unit}
                </Typography>
              ) : null,
            }}
            sx={{
              "& input[type=number]": { MozAppearance: "textfield" },
              "& input[type=number]::-webkit-outer-spin-button": { WebkitAppearance: "none", margin: 0 },
              "& input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
            }}
          />

          <TextField
            label="تاريخ الانتهاء"
            dir="ltr"
            type="datetime-local"
            fullWidth
            value={editForm.expires_at || ""}
            onChange={(e) => setEditForm((f) => ({ ...f, expires_at: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: getMinDateTime() }}
            helperText="اتركه فارغًا لعدم تحديد تاريخ انتهاء للخصم"
            FormHelperTextProps={{
              sx: {
                textAlign: "right",
                marginRight: 0,
              },
            }}
          />

          {/* <FormControlLabel
            control={<Switch checked={Boolean(editForm.is_active)} onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))} />}
            label="الخصم مفعل"
          /> */}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "center", gap: "12px" }}>
          <Button onClick={saveEdit} disabled={saving} variant="contained" sx={{ width: "64px", height: "36.5px" }}>
            {saving ? <CircularProgress size={16} color="inherit" /> : "حفظ"}
          </Button>

          <Button onClick={closeEdit} disabled={saving} color="inherit">
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }} icon={false}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
