import Knock from "@knocklabs/node";

const knock = new Knock({
  apiKey: process.env["KNOCK_API_SECRET"], // This is the default and can be omitted
});

interface User {
  id: string;
  name?: string;
  email?: string;
}

export const triggerNotification = async (user: User) => {
  const response = await knock.workflows.trigger("knock-testing", {
    recipients: [
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    ],
    // data: { dinosaur: "triceratops" },
  });
  console.log(response.workflow_run_id);
};
