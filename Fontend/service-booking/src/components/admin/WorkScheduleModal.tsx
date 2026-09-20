"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
} from "lucide-react";
import { StaffItem } from "@/types/staff";
import { WorkScheduleItem, CreateWorkSchedulePayload, UpdateWorkSchedulePayload } from "@/types/workSchedule";
import { workScheduleApi } from "@/services/workScheduleApi";

interface WorkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffItem | null;
  token: string | null;
  onShowToast: (message: string, type: "success" | "error") => void;
}

// Generate time slots from 01:00 to 23:00 (every 30 minutes)
const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 1; hour <= 23; hour++) {
    const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
    options.push(`${hourStr}:00`);
    options.push(`${hourStr}:30`);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// Helper to format date YYYY-MM-DD
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const WorkScheduleModal: React.FC<WorkScheduleModalProps> = ({
  isOpen,
  onClose,
  staff,
  token,
  onShowToast,
}) => {
  const [schedules, setSchedules] = useState<WorkScheduleItem[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form State for Create / Edit Schedule
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkScheduleItem | null>(null);
  const [workDate, setWorkDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Load Work Schedules list for the target staff
  const loadSchedules = useCallback(
    async (page: number = 1) => {
      if (!staff) return;
      setIsLoading(true);
      try {
        const res = await workScheduleApi.getWorkSchedules(staff.id, page, pageSize, token || undefined);
        setSchedules(res.data || []);
        setPageNumber(res.pageNumber || page);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Không thể tải lịch làm việc";
        onShowToast(msg, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [staff, pageSize, token, onShowToast]
  );

  useEffect(() => {
    if (isOpen && staff) {
      setIsFormOpen(false);
      setEditingSchedule(null);
      setFormError(null);
      loadSchedules(1);
    }
  }, [isOpen, staff, loadSchedules]);

  if (!isOpen || !staff) return null;

  const isStaffLocked = !staff.isActive;

  // Open Form to Add Schedule
  const handleOpenAddForm = () => {
    if (isStaffLocked) return;
    setEditingSchedule(null);
    setWorkDate(todayStr);
    setStartTime("08:00");
    setEndTime("17:00");
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Form to Edit Schedule
  const handleOpenEditForm = (schedule: WorkScheduleItem) => {
    if (isStaffLocked) return;
    setEditingSchedule(schedule);
    setWorkDate(schedule.workDate ? schedule.workDate.split("T")[0] : todayStr);
    setStartTime(schedule.startTime ? schedule.startTime.slice(0, 5) : "08:00");
    setEndTime(schedule.endTime ? schedule.endTime.slice(0, 5) : "17:00");
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle Delete Schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (isStaffLocked || !token) return;
    if (!confirm(`Bạn có chắc chắn muốn XÓA lịch làm việc #${scheduleId}?`)) return;

    try {
      const res = await workScheduleApi.deleteWorkSchedule(staff.id, scheduleId, token);
      onShowToast(res.message || `Đã xóa lịch làm việc #${scheduleId} thành công`, "success");
      loadSchedules(pageNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xóa lịch làm việc";
      onShowToast(msg, "error");
    }
  };

  // Helper to check if a specific time option is in the past for the selected date
  const isTimeInPast = (selectedDateStr: string, timeOptionStr: string): boolean => {
    if (!selectedDateStr) return false;

    const now = new Date();
    const [year, month, day] = selectedDateStr.split("-").map(Number);
    const [hours, minutes] = timeOptionStr.split(":").map(Number);

    const optionDateTime = new Date(year, month - 1, day, hours, minutes, 0);

    return optionDateTime.getTime() < now.getTime();
  };

  // Helper to compare startTime and endTime (returns true if startTime < endTime)
  const isStartTimeBeforeEndTime = (start: string, end: string): boolean => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    return startTotalMinutes < endTotalMinutes;
  };

  // Handle Form Submit (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isStaffLocked) {
      setFormError("Nhân viên đang bị khóa tài khoản, không thể cập nhật lịch làm việc!");
      return;
    }

    if (!workDate) {
      setFormError("Vui lòng chọn ngày làm việc.");
      return;
    }

    // 1. Check if selected date is in the past
    if (workDate < todayStr) {
      setFormError("Không thể xếp lịch làm việc cho các ngày trong quá khứ!");
      return;
    }

    if (!startTime || !endTime) {
      setFormError("Vui lòng chọn giờ bắt đầu và giờ kết thúc.");
      return;
    }

    // 2. Check if StartTime < EndTime
    if (!isStartTimeBeforeEndTime(startTime, endTime)) {
      setFormError("Thời gian bắt đầu (StartTime) phải nhỏ hơn thời gian kết thúc (EndTime)!");
      return;
    }

    // 3. Realtime check: Cannot set schedule in the past (e.g. today 6:30pm cannot set 8:00am)
    if (isTimeInPast(workDate, startTime)) {
      setFormError("Thời gian bắt đầu ca làm việc đã trôi qua trong quá khứ! Vui lòng chọn khung giờ từ hiện tại trở đi.");
      return;
    }

    if (!token) {
      onShowToast("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!", "error");
      return;
    }

    setIsSubmitting(true);
    const payload: CreateWorkSchedulePayload | UpdateWorkSchedulePayload = {
      workDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
    };

    try {
      if (editingSchedule) {
        // Update Schedule (PUT /api/staffs/{staffId}/workschedules/{scheduleId})
        const res = await workScheduleApi.updateWorkSchedule(staff.id, editingSchedule.id, payload, token);
        onShowToast(res.message || "Cập nhật lịch làm việc thành công!", "success");
      } else {
        // Create Schedule (POST /api/staffs/{staffId}/workschedules)
        const res = await workScheduleApi.createWorkSchedule(staff.id, payload, token);
        onShowToast(res.message || "Tạo lịch làm việc mới thành công!", "success");
      }

      setIsFormOpen(false);
      setEditingSchedule(null);
      loadSchedules(pageNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác lịch làm việc thất bại";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-zinc-900 border border-amber-500/30 shadow-2xl text-white flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Lịch Làm Việc Nhân Viên</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-amber-400 text-xs font-mono font-bold border border-zinc-700">
                  #{staff.id}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Họ tên: <strong className="text-white">{staff.fullName}</strong> ({staff.email})</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Warning Banner if Staff is Locked */}
          {isStaffLocked && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold">Nhân viên này hiện đang bị khóa tài khoản!</p>
                <p className="text-rose-400/80">Không thể thực hiện xếp thêm lịch hoặc chỉnh sửa/xóa lịch làm việc khi tài khoản đã bị khóa.</p>
              </div>
            </div>
          )}

          {/* Form Create / Edit Section */}
          {isFormOpen ? (
            <form onSubmit={handleSubmitForm} className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{editingSchedule ? `Chỉnh Sửa Lịch #${editingSchedule.id}` : "Tạo Lịch Làm Việc Mới"}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Đóng Form
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Work Date - min set to todayStr so past dates are disabled in calendar */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Ngày Làm Việc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500">Chỉ cho phép chọn từ hôm nay trở đi</p>
                </div>

                {/* Start Time Select (01:00 to 23:00) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Giờ Bắt Đầu (StartTime) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {TIME_OPTIONS.map((timeOption) => {
                      const disabled = isTimeInPast(workDate, timeOption);
                      return (
                        <option
                          key={timeOption}
                          value={timeOption}
                          disabled={disabled}
                          className={disabled ? "text-zinc-600 bg-zinc-950" : "text-white bg-zinc-900"}
                        >
                          {timeOption} {disabled ? "(Đã qua)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* End Time Select (01:00 to 23:00) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Giờ Kết Thúc (EndTime) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {TIME_OPTIONS.map((timeOption) => {
                      const disabled = isTimeInPast(workDate, timeOption);
                      return (
                        <option
                          key={timeOption}
                          value={timeOption}
                          disabled={disabled}
                          className={disabled ? "text-zinc-600 bg-zinc-950" : "text-white bg-zinc-900"}
                        >
                          {timeOption} {disabled ? "(Đã qua)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="py-2 px-4 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isStaffLocked}
                  className="py-2 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingSchedule ? "Lưu Cập Nhật" : "Xác Nhận Tạo Lịch"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Top Control Bar for Schedule List */
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-300">
                Danh Sách Ca Làm Việc (Tổng cộng: <strong className="text-amber-400">{totalCount}</strong>)
              </h4>

              <button
                disabled={isStaffLocked}
                onClick={handleOpenAddForm}
                className={`py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  isStaffLocked
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50 border border-zinc-700/50"
                    : "bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer shadow-md shadow-amber-500/20"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Lịch Làm Việc</span>
              </button>
            </div>
          )}

          {/* Schedules Table */}
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 font-bold uppercase text-amber-400 tracking-wider">
                  <th className="py-3 px-4 text-center">ID</th>
                  <th className="py-3 px-4">Ngày Làm Việc</th>
                  <th className="py-3 px-4 text-center">Giờ Bắt Đầu</th>
                  <th className="py-3 px-4 text-center">Giờ Kết Thúc</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-1" />
                      <span>Đang tải lịch làm việc...</span>
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                      Nhân viên này chưa có lịch làm việc nào. Bấm "Thêm Lịch Làm Việc" để xếp ca.
                    </td>
                  </tr>
                ) : (
                  schedules.map((sc) => (
                    <tr key={sc.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-bold text-zinc-400">
                        #{sc.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {sc.workDate ? sc.workDate.split("T")[0] : ""}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">
                        {sc.startTime ? sc.startTime.slice(0, 5) : ""}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-amber-400 font-bold">
                        {sc.endTime ? sc.endTime.slice(0, 5) : ""}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            disabled={isStaffLocked}
                            onClick={() => handleOpenEditForm(sc)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isStaffLocked
                                ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                                : "bg-zinc-900 hover:bg-amber-500/20 border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 cursor-pointer"
                            }`}
                            title={isStaffLocked ? "Nhân viên bị khóa - Không thể sửa" : "Sửa ca làm việc"}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            disabled={isStaffLocked}
                            onClick={() => handleDeleteSchedule(sc.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isStaffLocked
                                ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                                : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 cursor-pointer"
                            }`}
                            title={isStaffLocked ? "Nhân viên bị khóa - Không thể xóa" : "Xóa ca làm việc này"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
              <div>
                Trang <span className="font-bold text-white">{pageNumber}</span> / <span className="font-bold text-white">{totalPages}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={pageNumber <= 1 || isLoading}
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={pageNumber >= totalPages || isLoading}
                  onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 text-right shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
