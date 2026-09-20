import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // In local development, bypass self-signed SSL certificate errors from https://localhost:7118
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const backendUrl = "https://localhost:7118/api/Auth/login";

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.title ||
            (response.status === 401
              ? "Email hoặc mật khẩu không chính xác"
              : `Máy chủ Backend trả về lỗi (Status: ${response.status})`),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Không thể kết nối đến Backend";
    return NextResponse.json(
      {
        message: `Lỗi kết nối Backend API (https://localhost:7118): ${errMessage}. Vui lòng kiểm tra lại xem Backend ASP.NET đang chạy hay chưa.`,
      },
      { status: 500 }
    );
  }
}
