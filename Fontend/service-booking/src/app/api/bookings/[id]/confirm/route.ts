import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/bookings";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_BASE}/${id}/confirm`, {
      method: "PATCH",
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            (response.status === 403
              ? "Chỉ tài khoản Admin mới có quyền xác nhận lịch đặt"
              : `Xác nhận lịch đặt #${id} thất bại (Status: ${response.status})`),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { message: `Đã xác nhận booking #${id} thành công` });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi kết nối";
    return NextResponse.json(
      { message: `Không thể kết nối Backend API: ${errMessage}` },
      { status: 500 }
    );
  }
}
