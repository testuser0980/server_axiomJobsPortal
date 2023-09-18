const nodeMailer = require("nodemailer");

const sendEmail = async (Options) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SMPT_USER,
    to: Options.email,
    subject: Options.subject,
    html: `
      <div class="job_application_email_template">
        <h4 style="color: #ff0000;font-size: 30px;line-height: 30px;margin:0;">AxiomJobs</h4>
        <hr />
        <p style="margin: 0;">You have successfully applied for the job with following details:</p>
        <table style="width: 100%;vertical-align: middle;border: 1px solid #f1f1f1;margin-top: 20px;">
          <tr style="text-align: left;">
            <th style="border-right: 1px solid #f1f1f1;border-bottom: 1px solid #f1f1f1;">Name</th>
            <th style="border-right: 1px solid #f1f1f1;border-bottom: 1px solid #f1f1f1;">Category</th>
            <th style="border-right: 1px solid #f1f1f1;border-bottom: 1px solid #f1f1f1;">Location</th>
            <th style="border-right: 1px solid #f1f1f1;border-bottom: 1px solid #f1f1f1;">Nature</th>
            <th style="border-bottom: 1px solid #f1f1f1;">Status</th>
          </tr>
          <tr>
            <td style="border-right: 1px solid #f1f1f1;">${Options.name}</td>
            <td style="border-right: 1px solid #f1f1f1;">${Options.category}</td>
            <td style="border-right: 1px solid #f1f1f1;">${Options.nature}</td>
            <td style="border-right: 1px solid #f1f1f1;">${Options.location}</td>
            <td>${Options.status}</td>
          </tr>
        </table>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
