export async function GET(request) {
  return Response.json(
    {
      message: "ping pong",
    },
    { status: 200, statusText: "Ok" },
  );
}
