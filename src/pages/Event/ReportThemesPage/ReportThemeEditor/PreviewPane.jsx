export default function PreviewPane({ design }) {
  const {
    heading,
    subHeading,
    body,
    watermark,
    logo,
    image,
    typography,
    colors,
    imageSettings,
  } = design;

  return (
    <div
      style={{
        position: "relative",
        width: "629px",
        height: "1079px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        backgroundColor: "#fff",
      }}
    >
      {/* Decorative frame background (uploaded image) */}
      <img
        src={`${import.meta.env.BASE_URL}images/report-frame.jpg`}
        alt="Report Frame"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "100px 70px",
          textAlign: typography.textAlign || "center",
          color: colors.body,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "60px" }}>
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "140px",
                height: "auto",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                width: "140px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px dashed rgba(0,0,0,0.2)",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                color: "rgba(0,0,0,0.3)",
                backgroundColor: "rgba(255,255,255,0.5)",
              }}
            >
              LOGO
            </div>
          )}
        </div>

        {/* Headings */}
        <h1
          style={{
            fontFamily: typography.headingFont,
            fontWeight: typography.headingWeight,
            fontSize: `${typography.headingSize}px`,
            color: colors.heading,
            marginBottom: "10px",
            lineHeight: "1.2",
             textAlign: typography.headingTextAlign || "left",
          }}
        >
          {heading}
        </h1>

        <h2
          style={{
            fontFamily: typography.subHeadingFont,
            fontWeight: typography.subHeadingWeight,
            fontSize: `${typography.subHeadingSize}px`,
            color: colors.subHeading,
            marginBottom: "20px",
            lineHeight: "1.4",
             textAlign: typography.subHeadingTextAlign || "left",
          }}
        >
          {subHeading}
        </h2>

        <p
          style={{
            fontFamily: typography.bodyFont,
            fontWeight: typography.bodyWeight,
            fontSize: `${typography.bodySize}px`,
            lineHeight: "1.6",
            maxWidth: "420px",
            marginBottom: "60px",
              textAlign: typography.bodyTextAlign || "left",
          }}
        >
          {body}
        </p>

        {/* Watermark */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: "700",
            opacity: 0.15,
            letterSpacing: "2px",
            marginBottom: "40px",
          }}
        >
          {watermark}
        </div>

        {/* Main Image */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "250px",
            borderRadius: `${imageSettings.radius}px`,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        >
          {image ? (
            <img
              src={image}
              alt="Main"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed rgba(0,0,0,0.2)",
                color: "rgba(0,0,0,0.3)",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              IMAGE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
