import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/staffs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { id, scheduleId } = await params;
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_BASE}/${id}/workschedules/${scheduleId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || `Không thể lấy thông tin lịch làm việc #${scheduleId}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi mạng";
    return NextResponse.json(
      { message: `Lỗi kết nối: ${errMessage}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { id, scheduleId } = await params;

    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_BASE}/${id}/workschedules/${scheduleId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.title ||
            (response.status === 403
              ? "Bạn không có quyền Admin để cập nhật lịch làm việc"
              : `Cập nhật lịch làm việc thất bại (Status: ${response.status})`),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { message: "Cập nhật lịch làm việc thành công" });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi kết nối";
    return NextResponse.json(
      { message: `Không thể kết nối: ${errMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const { id, scheduleId } = await params;
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_BASE}/${id}/workschedules/${scheduleId}`, {
      method: "DELETE",
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            (response.status === 403
              ? "Bạn không có quyền Admin để xóa lịch làm việc"
              : `Xóa lịch làm việc thất bại (Status: ${response.status})`),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data || { message: `Đã xóa lịch làm việc #${scheduleId} thành công` });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi kết nối";
    return NextResponse.json(
      { message: `Không thể kết nối: ${errMessage}` },
      { status: 500 }
    );
  }
}
