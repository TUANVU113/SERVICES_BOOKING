import { NextResponse } from "next/server";

const BACKEND_BASE = "https://localhost:7118/api/bookings/available-slots";

export async function GET(request: Request) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");
    const authHeader = request.headers.get("authorization");

    if (!serviceId || !staffId || !date) {
      return NextResponse.json(
        { message: "Vui lòng cung cấp serviceId, staffId và date" },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_BASE}?serviceId=${serviceId}&staffId=${staffId}&date=${encodeURIComponent(date)}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Không thể tải danh sách khung giờ trống" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Lỗi mạng";
    return NextResponse.json(
      { message: `Lỗi kết nối Backend API: ${errMessage}` },
      { status: 500 }
    );
  }
}
