(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const e = React.createElement;

  const ASSETS = {
    profile: "./assets/profile.png",
    profileFriends: "./assets/about-friends.png",
    profileDoor: "./assets/profile-door.webp",
    profileFriendsCraft: "./assets/profile-friends.webp",
    dealRoom: "./assets/deal-room-engagement-showcase.png",
    chat: "./assets/contextual-chat-assistant-showcase.png",
    chatMotion: "./assets/contextual-chat-motion/contextual-chat-motion.mp4?v=2",
    chatMotionPoster: "./assets/contextual-chat-motion/poster.png?v=2",
    easyeat: "./assets/easyeat-customization-showcase.png",
    resonance: "./assets/resonance/resonance-featured.png?v=1",
    whiteLabel: "./assets/white-label/featured.jpg?v=1",
    resume: "./assets/Resume-Gaurav.pdf?v=20260822",
    logo: "./assets/logo-ga.svg",
    nomad: "./assets/design-playground/nomad-mobile-mockup.png",
    health: "./assets/design-playground/health-karma-mockup.png",
    swaply: "./assets/design-playground/swaply-mockup.png",
    splitly: "./assets/design-playground/splitly-expense-mockup.png",
    moov: "./assets/design-playground/moov-payment-plan-mockup.png",
    loadingPoster: "./assets/design-playground/loading-range-poster.png",
    loadingVideo: "./assets/design-playground/loading-range.mp4",
    spaceBetweenPoster: "./assets/design-playground/space-between-poster.png",
    spaceBetweenVideo: "./assets/design-playground/space-between.mp4",
    iconLinkedin: "./assets/icons/linkedin.png",
    iconMail: "./assets/icons/mail.png",
  };

  const FEATURED = [
    {
      href: "./contextual-chat-short.html",
      img: ASSETS.chatMotionPoster,
      video: ASSETS.chatMotion,
      title: "Contextual chat for investor discovery",
      sub: "Designed and launched an AI chat assistant so investors explore companies in natural language - replacing a fragmented multi-step search. OpenAI + vector search cut search from 30–40 minutes to under 30s and lifted engagement 25%.",
      tags: ["AI Search", "B2B SaaS"],
      lead: true,
    },
    {
      href: "./deal-room-short.html",
      img: ASSETS.dealRoom,
      title: "Deal Room - structured deal execution",
      sub: "Deal work was split across surfaces. We anchored creation on the company profile - where intent already lives. +32% deal creation adoption.",
      tags: ["Deal Room", "B2B SaaS"],
      deal: true,
      span: 6,
    },
    {
      href: "./easyeat-case-study.html",
      img: ASSETS.easyeat,
      title: "EasyEat customization redesign",
      sub: "Multi-country launch across Android and iOS. Redesigned monetisation and customization flows for clearer CTAs and less friction. +8.3% QR adoption in 3 weeks.",
      tags: ["FoodTech", "Mobile UX"],
      span: 4,
    },
    {
      href: "./resonance-short.html",
      resonance: true,
      img: ASSETS.resonance,
      title: "Spotify Resonance - AI Intelligent Music Playback",
      sub: "Speculative Spotify playback that starts songs closer to the moments you actually want to hear.",
      tags: ["AI", "Music Experience", "Product Design"],
      span: 4,
    },
    {
      href: "./white-label-short.html",
      img: ASSETS.whiteLabel,
      title: "White Label Setup",
      sub: "Investors set a URL, logo, and sender in Settings. The old page looked live before anything was set. I redesigned it so the firm starts empty, then looks live.",
      tags: ["B2B SaaS", "Fintech"],
      span: 6,
      whitelabel: true,
    },
  ];

  const PLAYGROUND = [
    { id: "space-between", title: "Space Between", img: ASSETS.spaceBetweenPoster, video: ASSETS.spaceBetweenVideo, tip: "Space Between · Motion", kind: "motion" },
    { id: "nomad", title: "Nomad", img: ASSETS.nomad, tip: "Nomad · Interface", kind: "interface" },
    { id: "health-karma", title: "Health Karma", img: ASSETS.health, tip: "Health Karma · Interface", kind: "interface" },
    { id: "loading-range", title: "Loading Range", img: ASSETS.loadingPoster, video: ASSETS.loadingVideo, tip: "Loading Range · Motion", kind: "motion" },
    { id: "swaply", title: "Swaply", img: ASSETS.swaply, tip: "Swaply · Interface", kind: "interface" },
    { id: "splitly", title: "Splitly", img: ASSETS.splitly, tip: "Splitly · Interface", kind: "interface" },
    { id: "moov", title: "moov", img: ASSETS.moov, tip: "moov · Interface", kind: "interface" },
  ];

  const BRING = [
    {
      icon: "01",
      title: "Clarity in complex systems",
      body: "I turn fragmented enterprise workflows into structured paths people can finish with confidence.",
    },
    {
      icon: "02",
      title: "Human–AI product craft",
      body: "Query states, progressive disclosure, and failure paths designed for uncertain model responses.",
    },
    {
      icon: "03",
      title: "Measurable outcomes",
      body: "Adoption, speed, and decision quality - design choices tied to proof, not decoration.",
    },
  ];

  const TIMELINE = [
    {
      heading: "Education",
      rows: [
        {
          date: "2017 – 2021",
          title: "Bachelor of Design",
          body: "National Institute of Fashion Technology · CGPA 8. Design foundation spanning UX strategy, interaction, visual design, and systems thinking.",
        },
      ],
    },
    {
      heading: "Work Experience",
      rows: [
        {
          date: "Mar 2023 – Present",
          title: "Product Designer II at Systematic",
          body: "New York, United States · Remote. AI-powered B2B SaaS - contextual chat, AI profile creation, search, data room, and templates for fundraising workflows.",
        },
        {
          date: "Aug 2022 – Nov 2022",
          title: "Product Designer at Valeo Health",
          body: "Gurugram, India. Early-stage healthcare SaaS across web, mobile web, and app. Led multi-language UX and scalable cross-platform patterns.",
        },
        {
          date: "Dec 2021 – Aug 2022",
          title: "UI/UX Designer at Easy Eat",
          body: "Gurugram, India. Multi-country product launch for Android and iOS. Redesigned monetisation flows and defined animation and micro-interaction guidelines.",
        },
        {
          date: "Jan 2021 – Dec 2021",
          title: "Visual Designer at LA FUORI",
          body: "New Delhi, India. Sole designer on a B2B website - IA, wireframes, and visual execution - plus campaigns, motion, and brand assets.",
        },
      ],
    },
  ];

  function Icon({ name }) {
    if (name === "work") {
      return e("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
        e("rect", { x: 3, y: 7, width: 18, height: 13, rx: 2, stroke: "currentColor", strokeWidth: 1.7 }),
        e("path", { d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", stroke: "currentColor", strokeWidth: 1.7 })
      );
    }
    if (name === "about") {
      return e("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
        e("circle", { cx: 12, cy: 8, r: 3.2, stroke: "currentColor", strokeWidth: 1.7 }),
        e("path", { d: "M5 19c1.5-3.2 4-4.8 7-4.8S17.5 15.8 19 19", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" })
      );
    }
    if (name === "contact") {
      return e("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
        e("rect", { x: 3, y: 5, width: 18, height: 14, rx: 2, stroke: "currentColor", strokeWidth: 1.7 }),
        e("path", { d: "m4 8 8 6 8-6", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" })
      );
    }
    if (name === "linkedin") {
      return e("img", {
        className: "ga-icon-img",
        src: ASSETS.iconLinkedin,
        alt: "",
        width: 14,
        height: 14,
        decoding: "async",
        "aria-hidden": "true",
      });
    }
    if (name === "mail") {
      return e("img", {
        className: "ga-icon-img",
        src: ASSETS.iconMail,
        alt: "",
        width: 14,
        height: 14,
        decoding: "async",
        "aria-hidden": "true",
      });
    }
    return null;
  }

  function Eye({ sizeClass }) {
    return e("span", {
      className: "ga-eye " + (sizeClass || ""),
      "data-eye": "true",
      "aria-hidden": "true",
    }, e("span", { className: "ga-pupil", "data-pupil": "true" }));
  }

  function Splash({ onDone }) {
    const [phase, setPhase] = useState("boot");
    const reduced = useRef(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    useEffect(() => {
      document.body.classList.add("is-splash-active");
      const t = reduced.current
        ? [0, 40, 80, 120, 160]
        : [200, 1700, 1920, 2770, 4050];
      const ids = [
        setTimeout(() => setPhase("ring"), t[0]),
        setTimeout(() => setPhase("cover"), t[1]),
        setTimeout(() => setPhase("ready"), t[2]),
        setTimeout(() => setPhase("reveal"), t[3]),
        setTimeout(() => {
          setPhase("done");
          document.body.classList.remove("is-splash-active");
          onDone();
        }, t[4]),
      ];
      return () => ids.forEach(clearTimeout);
    }, [onDone]);

    const cls = [
      "splash",
      ["ring", "cover", "ready", "reveal"].includes(phase) ? "is-ringing" : "",
      phase === "cover" || phase === "ready" ? "is-covering" : "",
      phase === "reveal" ? "is-revealing" : "",
      phase === "done" ? "is-done" : "",
    ].filter(Boolean).join(" ");

    return e("div", { className: cls, role: "status", "aria-label": "Loading" },
      e("div", { className: "splash-wipe", "aria-hidden": true }),
      e("div", { className: "splash-logo", "aria-hidden": true },
        e("svg", { className: "splash-ring", viewBox: "0 0 80 80" },
          e("circle", { className: "splash-ring-track", cx: 40, cy: 40, r: 36 }),
          e("circle", { className: "splash-ring-progress", cx: 40, cy: 40, r: 36 })
        ),
        e("span", { className: "splash-logo-mark" },
          e("img", { src: ASSETS.logo, alt: "", width: 72, height: 39, decoding: "async" })
        )
      )
    );
  }

  function useEyes() {
    useEffect(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
      let pending = false;

      function updatePupils() {
        pending = false;
        document.querySelectorAll("[data-eye]").forEach((eye) => {
          const pupil = eye.querySelector("[data-pupil]");
          if (!pupil) return;
          const r = eye.getBoundingClientRect();
          if (!r.width) return;
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = mouse.x - cx;
          const dy = mouse.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = Math.min(dist / 240, 1);
          const maxX = r.width * 0.2;
          const maxY = r.height * 0.2;
          pupil.style.transform =
            "translate(" + ((dx / dist) * maxX * reach).toFixed(1) + "px," +
            ((dy / dist) * maxY * reach).toFixed(1) + "px)";
        });
      }

      function requestUpdate() {
        if (!pending) {
          pending = true;
          requestAnimationFrame(updatePupils);
        }
      }

      const onMove = (ev) => {
        mouse.x = ev.clientX;
        mouse.y = ev.clientY;
        requestUpdate();
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("scroll", requestUpdate, { passive: true, capture: true });

      let blinkTimer = 0;
      const blinkEye = (eye, cls, ms) => {
        eye.classList.add(cls);
        setTimeout(() => eye.classList.remove(cls), ms);
      };
      const scheduleBlink = () => {
        if (reduced) return;
        blinkTimer = window.setTimeout(() => {
          document.querySelectorAll("[data-eye]").forEach((eye) => blinkEye(eye, "is-blinking", 160));
          scheduleBlink();
        }, 2000 + Math.random() * 4000);
      };
      scheduleBlink();

      const onClick = (ev) => {
        const eye = ev.target.closest && ev.target.closest("[data-eye]");
        if (!eye) return;
        eye.classList.remove("is-blinking");
        blinkEye(eye, "is-winking", 320);
      };
      document.addEventListener("click", onClick);

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", requestUpdate, true);
        document.removeEventListener("click", onClick);
        clearTimeout(blinkTimer);
      };
    }, []);
  }

  /* Michelle-style sticky cover parallax + hero plx */
  function useCoverScroll(ready) {
    useEffect(() => {
      if (!ready) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      /* Michelle: section plx desktop-only (≤900 off). Hero nudge can stay lighter on phone. */
      const mqCoverOff = window.matchMedia("(max-width: 900px)");
      const mqPhone = window.matchMedia("(max-width: 640px)");
      const coverSelector = ".ga-more-work, .ga-bring, .ga-about, .ga-contact";

      const ensureCoverInner = (section) => {
        let inner = section.querySelector(":scope > .ga-cover-inner");
        if (inner) return inner;
        inner = document.createElement("div");
        inner.className = "ga-cover-inner";
        while (section.firstChild) inner.appendChild(section.firstChild);
        section.appendChild(inner);
        return inner;
      };

      document.querySelectorAll(coverSelector).forEach(ensureCoverInner);

      let pending = false;
      const introPanel = document.querySelector(".ga-panel--intro");
      const fold = document.querySelector(".ga-fold");

      const applyHeroEyesParallax = (el, plx) => {
        const lift = parseFloat(el.dataset.lift || 0);
        let ty = plx - lift;
        el.style.transform = "translateY(" + ty.toFixed(1) + "px)";
        if (!introPanel) return;
        const minGap = 16;
        const overflow = el.getBoundingClientRect().bottom - (introPanel.getBoundingClientRect().top - minGap);
        if (overflow > 0) {
          ty -= overflow;
          el.style.transform = "translateY(" + ty.toFixed(1) + "px)";
        }
      };

      const clearCoverTransforms = () => {
        document.querySelectorAll(".ga-cover-inner").forEach((el) => {
          el.style.transform = "";
        });
      };

      const parallax = () => {
        const vh = window.innerHeight || 800;
        const coverOff = mqCoverOff.matches;
        const heroScale = mqPhone.matches ? 0.35 : coverOff ? 0.7 : 1;

        if (fold) {
          fold.classList.toggle("is-eyes-lifted", window.scrollY > 8);
        }

        document.querySelectorAll("[data-plx]").forEach((el) => {
          const factor = (parseFloat(el.getAttribute("data-plx")) || 0) * heroScale;
          if (!factor) {
            el.style.transform = "";
            return;
          }
          const sec = el.closest("[data-screen-label]") || el.parentElement;
          const r = sec.getBoundingClientRect();
          const d = r.top + r.height / 2 - vh / 2;
          const plx = -d * factor;
          if (el.classList.contains("ga-hero-eyes-parallax")) {
            applyHeroEyesParallax(el, plx);
            return;
          }
          el.style.transform = "translateY(" + plx.toFixed(1) + "px)";
        });

        if (coverOff) {
          clearCoverTransforms();
          return;
        }

        document.querySelectorAll(coverSelector).forEach((section) => {
          const inner = section.querySelector(":scope > .ga-cover-inner");
          if (!inner) return;
          const factor = parseFloat(section.getAttribute("data-plx-section")) || 0.06;
          const roll = parseFloat(section.getAttribute("data-plx-roll")) || 0;
          const r = section.getBoundingClientRect();
          const d = r.top + r.height / 2 - vh / 2;
          const ty = (-d * factor).toFixed(1);
          const rot = roll ? ((d / vh) * roll).toFixed(2) : "0";
          inner.style.transform = "translateY(" + ty + "px) rotate(" + rot + "deg)";
        });
      };

      const onScroll = () => {
        if (!pending) {
          pending = true;
          requestAnimationFrame(() => {
            pending = false;
            parallax();
          });
        }
      };

      document.addEventListener("scroll", onScroll, { passive: true, capture: true });
      window.addEventListener("resize", onScroll, { passive: true });
      mqCoverOff.addEventListener("change", onScroll);
      mqPhone.addEventListener("change", onScroll);
      parallax();

      return () => {
        document.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onScroll);
        mqCoverOff.removeEventListener("change", onScroll);
        mqPhone.removeEventListener("change", onScroll);
        clearCoverTransforms();
      };
    }, [ready]);
  }

  function useReveals(ready) {
    useEffect(() => {
      if (!ready) return;
      const nodes = document.querySelectorAll(".ga-reveal");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        nodes.forEach((n) => n.classList.add("is-visible"));
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      nodes.forEach((n) => io.observe(n));
      return () => io.disconnect();
    }, [ready]);
  }

  function BrandMark() {
    return e("a", {
      href: "#top",
      className: "ga-brand",
      "aria-label": "Gaurav Avinash home",
      "data-tip": "Home",
    },
      e("img", {
        src: ASSETS.logo,
        alt: "",
        width: 112,
        height: 61,
        decoding: "async",
      })
    );
  }

  function Nav() {
    const tipRef = useRef(null);

    useEffect(() => {
      const tip = tipRef.current;
      if (!tip) return;
      const onOver = (ev) => {
        const el = ev.target.closest && ev.target.closest("[data-tip]");
        if (!el) return;
        const r = el.getBoundingClientRect();
        tip.textContent = el.getAttribute("data-tip");
        tip.style.left = r.left + r.width / 2 + "px";
        tip.style.top = r.bottom + 10 + "px";
        tip.classList.add("is-on");
      };
      const onOut = (ev) => {
        if (!(ev.target.closest && ev.target.closest("[data-tip]"))) return;
        tip.classList.remove("is-on");
      };
      document.addEventListener("mouseover", onOver);
      document.addEventListener("mouseout", onOut);
      return () => {
        document.removeEventListener("mouseover", onOver);
        document.removeEventListener("mouseout", onOut);
      };
    }, []);

    return e(React.Fragment, null,
      e("nav", { className: "ga-nav", "aria-label": "Primary" },
        e("a", { href: "#top", className: "ga-nav-home", "aria-label": "Home", "data-tip": "Home" },
          e(Eye), e(Eye)
        ),
        e("div", { className: "ga-nav-links" },
          e("a", { href: "#work", className: "ga-nav-link", "aria-label": "Work", "data-tip": "Work" }, e(Icon, { name: "work" })),
          e("a", { href: "#about", className: "ga-nav-link", "aria-label": "About", "data-tip": "About" }, e(Icon, { name: "about" })),
          e("a", { href: "#contact", className: "ga-nav-link", "aria-label": "Contact", "data-tip": "Contact" }, e(Icon, { name: "contact" }))
        )
      ),
      e("div", { className: "ga-tooltip", ref: tipRef, "aria-hidden": true })
    );
  }

  function WorkCard({ item }) {
    const videoRef = useRef(null);
    const reducedMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const useVideo = Boolean(item.video) && !reducedMotion;

    useEffect(() => {
      const video = videoRef.current;
      if (!useVideo || !video) return undefined;

      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;
      video.controls = false;
      video.removeAttribute("controls");
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("disablepictureinpicture", "");

      const play = () => {
        video.muted = true;
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      };

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) play();
          else video.pause();
        });
      }, { threshold: 0.15 });

      io.observe(video);
      play();
      video.addEventListener("loadeddata", play);
      video.addEventListener("canplay", play);

      return () => {
        io.disconnect();
        video.removeEventListener("loadeddata", play);
        video.removeEventListener("canplay", play);
        video.pause();
      };
    }, [useVideo, item.video]);

    const media = useVideo
      ? e("video", {
          ref: videoRef,
          className: "ga-card-media-video",
          src: item.video,
          poster: item.img,
          muted: true,
          loop: true,
          playsInline: true,
          autoPlay: true,
          preload: "auto",
          controls: false,
          disablePictureInPicture: true,
          "webkit-playsinline": "true",
          "aria-hidden": true,
        })
      : e("img", {
          src: item.img,
          alt: item.locked ? item.title : "",
          loading: "lazy",
          decoding: "async",
        });

    const className = [
      "ga-card",
      item.lead ? "ga-card--lead" : "",
      useVideo ? "ga-card--motion" : "",
      item.locked ? "ga-card--locked" : "",
      item.wip ? "ga-card--wip" : "",
      item.resonance ? "ga-card--resonance" : "",
      item.deal ? "ga-card--deal" : "",
      item.whitelabel ? "ga-card--whitelabel" : "",
      item.icon ? "ga-card--icon" : "",
      item.span ? "ga-card--span-" + item.span : "",
    ].filter(Boolean).join(" ");

    // Header / title / sub; Resonance keeps existing tags only (no extras)
    const copyKids = [];
    if (item.eyebrow) {
      copyKids.push(e("span", { className: "ga-card-eyebrow", key: "eyebrow" }, item.eyebrow));
    }
    copyKids.push(e("span", { className: "ga-card-title", key: "title" }, item.title));
    if (item.sub) {
      copyKids.push(e("span", { className: "ga-card-sub", key: "sub" }, item.sub));
    } else if (item.reserveSub) {
      copyKids.push(e("span", { className: "ga-card-sub ga-card-sub--reserve", key: "sub" }));
    }
    if (item.tags && item.tags.length) {
      copyKids.push(
        e("span", { className: "ga-tags", key: "tags" },
          item.tags.map((t) => e("span", { className: "ga-tag", key: t }, t))
        )
      );
    }

    const copy = e("span", { className: "ga-card-copy" }, ...copyKids);

    // Locked / Coming Soon cards have no enter arrow
    const footer = item.locked
      ? null
      : e("span", { className: "ga-card-footer" },
          e("span", { className: "ga-card-arrow", "aria-hidden": true }, "↑")
        );

    const mediaKids = item.wip
      ? [
          e("span", { className: "ga-card-badge", key: "badge" }, "Coming soon"),
          media,
        ]
      : [media];

    const kids = [
      e("span", { className: "ga-card-media", key: "media" }, ...mediaKids),
      e("span", { className: "ga-card-body", key: "body" }, copy, footer),
    ];

    if (item.locked) {
      return e("article", {
        className,
        "aria-label": item.title + " - work in progress, locked",
      }, kids);
    }

    return e("a", {
      href: item.href,
      className,
    }, kids);
  }

  function MarqueeTile({ item, index, hidden }) {
    const rot = "ga-marquee-tile--" + ((index % 6) + 1);
    const kids = item.video
      ? e("video", {
          src: item.video,
          poster: item.img,
          muted: true,
          loop: true,
          playsInline: true,
          autoPlay: true,
          "aria-hidden": true,
        })
      : e("img", { src: item.img, alt: hidden ? "" : item.title, loading: "lazy" });

    const openPlayground = (ev) => {
      ev.preventDefault();
      if (hidden) return;
      if (window.DesignPlayground && typeof window.DesignPlayground.open === "function") {
        window.DesignPlayground.open(item.id);
      }
    };

    return e("button", {
      type: "button",
      className: "ga-marquee-tile " + rot,
      "data-tip": item.tip,
      "data-pg-id": item.id,
      "aria-label": "Open details for " + item.title,
      "aria-hidden": hidden ? "true" : undefined,
      tabIndex: hidden ? -1 : undefined,
      onClick: openPlayground,
    }, kids);
  }

  function FeaturedWork() {
    return e("section", { className: "ga-panel--featured", id: "work" },
      e("div", { className: "ga-reveal" },
        e("p", { className: "ga-eyebrow" }, e("span", { className: "ga-eyebrow-dot" }), "Featured work"),
        e("h2", { className: "ga-section-title" },
          "I design AI products for", e("br"), "complex B2B systems."
        )
      ),
      e("div", { className: "ga-featured-grid ga-reveal" },
        FEATURED.map((item) => e(WorkCard, { item, key: (item.href || "locked") + item.title }))
      )
    );
  }

  /* ───────────────── Craft mode ───────────────── */
  const CRAFT_KEY = "ga-craft-mode";

  function readCraftPref() {
    try { return window.localStorage.getItem(CRAFT_KEY) === "on"; } catch (err) { return false; }
  }

  function writeCraftPref(on) {
    try { window.localStorage.setItem(CRAFT_KEY, on ? "on" : "off"); } catch (err) { /* private mode */ }
  }

  function CraftGlyph() {
    return e("svg", { className: "craft-glyph", viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": "true", focusable: "false" },
      e("rect", { className: "craft-glyph-back", x: 7.5, y: 3.5, width: 13, height: 10, rx: 3 }),
      e("rect", { className: "craft-glyph-front", x: 3.5, y: 9.5, width: 13, height: 10, rx: 3 })
    );
  }

  function CraftSwitch({ on, onToggle }) {
    return e("button", {
      type: "button",
      className: "craft-switch" + (on ? " is-on" : ""),
      "aria-pressed": on ? "true" : "false",
      "aria-label": on ? "Craft mode on. Switch back to the classic portfolio" : "Craft mode off. Switch to Craft mode",
      title: on ? "Back to classic" : "Try Craft mode",
      onClick: onToggle,
    },
      e(CraftGlyph),
      e("span", { className: "craft-switch-label" }, "Craft"),
      e("span", { className: "craft-switch-track", "aria-hidden": "true" },
        e("span", { className: "craft-switch-thumb" })
      )
    );
  }

  /* Craft hero: the Mindset-style board, built from window.Craft (assets/craft/craft.js) */
  const CRAFT_WALLPAPERS = [
    { id: "fuji", label: "Fuji dawn" },
    { id: "dike", label: "Dike road" },
    { id: "barley", label: "Barley field" },
    { id: "kirkjufell", label: "Kirkjufell" },
    { id: "rows", label: "Seedling rows" },
  ];
  const CRAFT_WP_KEY = "ga-craft-wallpaper";
  const CRAFT_WP_HINT_KEY = "ga-craft-wp-hint";
  const CRAFT_WP_INTERVAL = 15000; /* auto shuffle, like macOS dynamic wallpapers */
  /* Taps on these never change the wallpaper */
  const CRAFT_WP_IGNORE = "button, a, input, label, [role='dialog'], .cr-card, .cr-orb-slot, .cr-notice, .cr-seg, .cr-dock, .cr-stack, .cr-wp-picker, .cr-topbar-left, .cr-wp-hint";

  function nextWallpaper(id) {
    const i = CRAFT_WALLPAPERS.findIndex((w) => w.id === id);
    return CRAFT_WALLPAPERS[(i + 1) % CRAFT_WALLPAPERS.length].id;
  }

  function preloadWallpaper(id) {
    const img = new Image();
    img.decoding = "async";
    img.src = "./assets/craft/wallpapers/" + id + (window.innerWidth >= 1600 || window.devicePixelRatio >= 1.5 ? "-2560" : "-1440") + ".webp";
  }

  function readWallpaper() {
    try {
      const v = window.localStorage.getItem(CRAFT_WP_KEY);
      if (CRAFT_WALLPAPERS.some((w) => w.id === v)) return v;
    } catch (err) { /* ignore */ }
    return CRAFT_WALLPAPERS[0].id;
  }

  /* Profile sheet history, read from the green site's TIMELINE so both stay in step.
     Work body: "Place. What he did. More." -> place + first sentence. Education body: "School · note. More." */
  function profileHistory() {
    const group = (name) => (TIMELINE.find((g) => g.heading === name) || { rows: [] }).rows;
    const split = (body) => {
      const i = body.indexOf(". ");
      const head = i < 0 ? body : body.slice(0, i);
      const rest = i < 0 ? "" : body.slice(i + 2);
      const j = rest.indexOf(". ");
      const first = (j < 0 ? rest : rest.slice(0, j + 1)).replace(/ - /g, ", ");
      return { head, first };
    };
    const experience = group("Work Experience").map((r) => {
      const at = r.title.split(" at ");
      const b = split(r.body);
      return { title: at[0], org: at[1] || "", place: b.head, note: b.first, dates: r.date, current: /present/i.test(r.date) };
    });
    const education = group("Education").map((r) => {
      const b = split(r.body);
      const parts = b.head.split(" · ");
      return { title: r.title, org: parts[0], place: parts.slice(1).join(" · "), dates: r.date };
    });
    return { experience, education };
  }

  function craftData(onExit) {
    const C = window.Craft;
    const S = C.sample({
      profile: ASSETS.profile, logo: ASSETS.logo, chat: ASSETS.chat, dealRoom: ASSETS.dealRoom,
      easyeat: ASSETS.easyeat, whiteLabel: ASSETS.whiteLabel, resonance: ASSETS.resonance,
      nomad: ASSETS.nomad, health: ASSETS.health, swaply: ASSETS.swaply, splitly: ASSETS.splitly,
      avatar: "./assets/craft/avatar/gaurav-3d-shirt-face-96.webp",
    });
    /* Board-only avatar (white shirt, glasses). The profile sheet keeps ASSETS.profile. */
    S.profile = Object.assign({}, S.profile, {
      image: "./assets/craft/avatar/gaurav-3d-shirt-520.webp",
      imageSet: "./assets/craft/avatar/gaurav-3d-shirt-520.webp 520w, ./assets/craft/avatar/gaurav-3d-shirt-1040.webp 1040w",
      imageSizes: "(max-width: 700px) 186px, 200px",
      cutout: true, head: null, figure: "bust",
    });
    S.profileSheet = Object.assign({}, S.profileSheet, profileHistory(), {
      image: ASSETS.profileDoor,
      images: [
        { src: ASSETS.profileDoor, alt: "Gaurav Avinash leaning on a wooden door in a white linen shirt", pos: "center 20%" },
        { src: ASSETS.profileFriendsCraft, alt: "Gaurav with three friends outdoors", pos: "center 50%" },
      ],
    });
    S.topbar = Object.assign({}, S.topbar, { avatar: ASSETS.logo });
    S.agenda = Object.assign({}, S.agenda, { avatar: null });
    S.preview = Object.assign({}, S.preview, { avatar: null });
    const hrefs = {
      "Contextual Chat": "./craft-contextual-chat-detailed.html",
      "Deal Room": "./craft-deal-room.html",
      "White Label": "./craft-white-label.html",
      "White Label Setup": "./craft-white-label.html",
      "EasyEat": "./craft-easyeat.html",
      "Resonance": "./craft-resonance.html",
      "Splitly": "./craft-splitly.html",
    };
    S.files = S.files.map((f) => (hrefs[f.title]
      ? Object.assign({}, f, { href: hrefs[f.title] })
      : Object.assign({}, f, { onClick: () => onExit("more-work") })));
    S.folders.rows = S.folders.rows.map((r) => Object.assign({}, r, { href: hrefs[r.title] }));
    S.folders.count = "All 4";
    /* Projects (Craft playground component): case studies and AI works. Facts from FEATURED and the
       case pages (meta description, first three fact lines). S.cases (all of them) feeds search. */
    const caseStudies = [
      { id: "contextual-chat", title: "Contextual Chat", href: hrefs["Contextual Chat"], image: ASSETS.chat, icon: "chatSpark", tone: "blue",
        sub: "Systematic", domain: "AI search", year: "2023 to now", summary: "AI chat so investors explore companies in plain language.",
        metric: { value: "+25%", label: "engagement" },
        description: "An AI assistant that lets investors search companies in plain language. Search went from 30 to 40 minutes to under 30 seconds.",
        facts: [["Role", "Product Designer II"], ["Team", "PM, ML, engineering, data"], ["Shipped in", "8 weeks"]] },
      { id: "deal-room", title: "Deal Room", href: hrefs["Deal Room"], image: ASSETS.dealRoom, icon: "dealDoc", tone: "orange",
        sub: "Systematic", domain: "B2B SaaS", year: "2023-24", summary: "Deal creation anchored on the company profile, where intent lives.",
        metric: { value: "+32%", label: "deal creation adoption" },
        description: "Deal creation on the company profile and NDAs signed inside Systematic. Deal creation went up 32%.",
        facts: [["Role", "Product Designer II"], ["Team", "Product, engineering, legal"], ["Timeline", "2023 to 2024"]] },
      { id: "white-label", title: "White Label Setup", href: hrefs["White Label"], image: ASSETS.whiteLabel, icon: "swatch", tone: "pink",
        sub: "Systematic", domain: "Fintech", year: "2025", summary: "A firm starts empty, then looks live once URL, logo and sender are set.",
        metric: { value: "3", label: "steps to live: URL, logo, sender" },
        description: "The Settings page where an investor firm sets its URL, logo and sender. The old page looked live before anything was set. I redesigned it so a firm starts empty, then looks live.",
        facts: [["Role", "Product Designer II"], ["Scope", "Settings hub"], ["Shipped in", "1 month"]] },
      { id: "easyeat", title: "EasyEat", href: hrefs["EasyEat"], image: ASSETS.easyeat, icon: "bowl", tone: "orange",
        sub: "Easy Eat", domain: "FoodTech", year: "2021-22", summary: "Every dish option on one screen that counts for you.",
        metric: { value: "+8.3%", label: "QR adoption in 3 weeks" },
        description: "Order customization: every variant and add-on on one screen that counts for you. QR adoption went up 8.3% in three weeks.",
        facts: [["Role", "UI/UX Designer"], ["Team", "PM, researcher, developers"], ["At Easy Eat", "Dec 2021 to Aug 2022"]] },
    ];
    /* AI works tab: one entry per project. live: "resonance" opens the Resonance popup from CraftHero;
       prototype: "https://..." opens a link instead. */
    const aiWorks = [
      { id: "resonance", title: "Spotify Resonance", href: hrefs["Resonance"], image: ASSETS.resonance, icon: "wave", tone: "blue",
        sub: "For Spotify", domain: "AI, Music", summary: "Playback that starts songs closer to the part you want to hear.",
        metric: { value: "Concept", label: "speculative, personal project", word: true },
        description: "A speculative, personal playback idea for Spotify that starts songs closer to the moment you actually want to hear. Not affiliated with Spotify.",
        facts: [["Context", "For Spotify, personal"], ["Type", "Speculative product"], ["Prototype", "Live in the browser"]],
        live: "resonance" },
      { id: "splitly", title: "Splitly", href: hrefs["Splitly"], image: "./assets/craft/case/sp-cover-sm.jpg", icon: "receipt", tone: "orange",
        sub: "Personal project", domain: "Fintech, AI-built", summary: "Split a bill and see who pays whom. Built with AI.",
        metric: { value: "Live", label: "AI-built prototype", word: true },
        description: "A split-the-bill app for friends in India. One of my first AI-driven design problems: designed in Figma, built with Claude, Cursor and AI agents.",
        facts: [["Context", "Personal project"], ["Built with", "Claude, Cursor, AI agents"], ["Prototype", "Live in the browser"]] },
    ];
    const asCase = (c) => Object.assign({ group: "case", label: "Open " + c.title + " case study" }, c);
    S.caseStudies = caseStudies.map(asCase);
    S.aiWorks = aiWorks.map(asCase);
    S.cases = S.caseStudies.concat(S.aiWorks);
    S.preview.href = hrefs["Contextual Chat"];
    /* Featured card on the board ("Growth Team" slot): one "Project" chip, icon well, arrow link.
       Cursor x/y are measured from the card's top-left (the preview area starts at the top). */
    S.preview = Object.assign({}, S.preview, {
      label: "Project", timer: null, icon: "chatSpark", tone: "blue", arrowHref: hrefs["Contextual Chat"],
      /* The assistant itself: the Systematic Agent chat panel (question + answer), cropped from the
         interaction demo. Poster first; the muted loop starts only while the card is on screen. */
      slides: null,
      clip: { poster: "./assets/craft/case/chat-panel-poster.jpg", video: "./assets/craft/case/chat-panel.mp4" },
      cursors: S.preview.cursors.map((c) => Object.assign({}, c, c.name === "You" ? { x: 58, y: 104 }
        : { x: 186, y: 184, avatarSet: "./assets/craft/avatar/gaurav-3d-shirt-face-96.webp 1x, ./assets/craft/avatar/gaurav-3d-shirt-face-192.webp 2x" })),
    });
    /* Top bar pill: rotating design notes (rendered by Craft.PhilosophyPill). Interleaved Norman, Rams, Gaurav.
       Norman and Rams lines are short paraphrases of their principles, not verbatim quotes.
       DRAFT (needs Gaurav's OK): the four Gaurav lines marked "draft" below are new, written in his voice.
       The first Gaurav line is his own stated principle. */
    const DN = { who: "Don Norman", work: "The Design of Everyday Things", mark: "DN" };
    const DR = { who: "Dieter Rams", mark: "DR" };
    const GA = { who: "Gaurav Avinash", mark: "GA" };
    S.topbar.notice = {
      label: "Design notes",
      seconds: 8,
      marks: { DN: { tone: "blue" }, DR: { tone: "orange" }, GA: { tone: "ink" } },
      items: [
        Object.assign({ idea: "If it needs a manual, the design failed" }, DN), /* discoverability */
        Object.assign({ idea: "Good design is honest" }, DR),
        Object.assign({ idea: "I don't simplify flows blindly. I protect intent." }, GA),
        Object.assign({ idea: "Show people what they can do" }, DN), /* affordances, signifiers */
        Object.assign({ idea: "Less, but better" }, DR),
        Object.assign({ idea: "I show where every number comes from" }, GA), /* draft: fintech trust */
        Object.assign({ idea: "Every action needs a clear response" }, DN), /* feedback */
        Object.assign({ idea: "Good design makes a product understandable" }, DR),
        Object.assign({ idea: "I make the AI show its sources" }, GA), /* draft: AI interfaces */
        Object.assign({ idea: "Controls should match what they move" }, DN), /* mapping */
        Object.assign({ idea: "Good design is long-lasting" }, DR),
        Object.assign({ idea: "I'll take dense data over a lost user" }, GA), /* draft: complex data workflows */
        Object.assign({ idea: "Blame the design, not the person" }, DN), /* human error */
        Object.assign({ idea: "Good design is unobtrusive" }, DR),
        Object.assign({ idea: "I ship the rough version, then listen" }, GA), /* draft: 0 to 1 */
      ],
    };
    S.stat.linkLabel = "View all work";
    /* Experience keys: the two named segments, short enough for the small card (full label in the tooltip) */
    S.stat.segments = S.stat.segments.map((s) => Object.assign({}, s, { short: s.label === "Fintech AI" ? "Fintech" : s.label }));
    S.hello = [
      { id: "email", name: "Email", icon: "mail", tone: "orange", go: "send", title: "Say hello",
        sub: "gauravavinash3@gmail.com", subParts: ["gauravavinash3", "@gmail.com"],
        href: "mailto:gauravavinash3@gmail.com", action: "Email Gaurav at gauravavinash3@gmail.com" },
      { id: "linkedin", name: "LinkedIn", icon: "linkedin", tone: "blue", go: "arrow", title: "LinkedIn",
        sub: "in/gauravavinash", href: "https://www.linkedin.com/in/gauravavinash", external: true, action: "Open Gaurav's LinkedIn (new tab)" },
      { id: "resume", name: "Resume", icon: "doc", tone: "plain", go: "download", title: "Resume",
        sub: "One page, PDF", href: ASSETS.resume, external: true, action: "Open Gaurav's resume, PDF (new tab)" },
    ];
    S.stack.onClick = () => onExit("more-work");
    /* Availability + booking on the date card (assets/craft/booking.js, Cal.com).
       status: "open" | "booked" | "not-looking". until: "YYYY-MM-DD" shown as "Booked until 12 Jan".
       Event type slugs must match Cal.com (cal.com/<calUsername>/<slug>). */
    S.availability = {
      calUsername: "gaurav-avinash-oqjm0c",
      eventTypes: [
        { slug: "15min", label: "15 min intro", minutes: 15 },
        { slug: "30min", label: "30 min interview", minutes: 30 },
      ],
      status: "open",
      until: null,
      email: "gauravavinash3@gmail.com",
      linkedin: "https://www.linkedin.com/in/gauravavinash",
      fallbackHours: "Mon to Fri, 12:00 to 19:00 IST",
      hoursIST: [12, 19],
    };
    S.profileSheet.links = [
      { label: "Resume", href: ASSETS.resume, external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/gauravavinash", external: true },
      { label: "Email", href: "mailto:gauravavinash3@gmail.com" },
    ];
    return S;
  }

  function openAssistant() {
    const fab = document.getElementById("paFab");
    if (fab) fab.click();
  }

  /* Board: the mindset "Dashboard" screen. 5 x 3 grid of 160px cells, 23px gutters
     (892 x 526 at scale 1). The reference screenshot is this canvas at 1.258x (1610 x 1052). */
  const BOARD = { w: 892, h: 526, tw: 709, th: 709 };
  function useBoardScale(stageRef) {
    const [layout, setLayout] = useState(() => (window.innerWidth <= 700 ? "stack" : "grid"));
    useEffect(() => {
      const fit = () => {
        const el = stageRef.current;
        if (!el) return;
        const w = window.innerWidth, h = window.innerHeight;
        // Mobile: CSS stacks the cards in a scrolling two-up column, no scaling.
        if (w <= 700) {
          el.dataset.crFit = "stack";
          delete el.dataset.crCols;
          el.style.removeProperty("--cr-scale");
          setLayout("stack");
          return;
        }
        // Desktop: board centred between the top bar and the corners, scaled like the
        // reference (1280 x 836 canvas), never closer than 100px to the top or bottom edge.
        if (w >= 1100 && h >= 620) {
          delete el.dataset.crFit;
          delete el.dataset.crCols;
          el.style.removeProperty("--cr-stage-h");
          el.style.removeProperty("--cr-board-top");
          const scale = Math.min(1.35, w / 1280, h / 836, (h - 200) / BOARD.h, (w - 120) / BOARD.w);
          el.style.setProperty("--cr-scale", Math.max(0.55, scale).toFixed(3));
          setLayout("grid");
          return;
        }
        // Tablet or short screens: fit between the top bar and the corners.
        // Portrait: a 4 x 4 board; landscape keeps the 5 x 3 board. Scroll instead of shrinking past 0.68.
        const portrait = w < 1100 && h > w;
        const bw = portrait ? BOARD.tw : BOARD.w, bh = portrait ? BOARD.th : BOARD.h;
        const top = w < 1100 ? 168 : 104, bottom = 112;
        let scale = Math.min(1.12, (w - 64) / bw, (h - top - bottom) / bh);
        scale = Math.max(Math.min(0.68, (w - 64) / bw), scale);
        const boardH = bh * scale;
        const room = Math.max(0, h - top - bottom - boardH);
        el.dataset.crFit = "flow";
        if (portrait) el.dataset.crCols = "2"; else delete el.dataset.crCols;
        el.style.setProperty("--cr-scale", scale.toFixed(3));
        el.style.setProperty("--cr-board-top", Math.round(top + room / 2) + "px");
        el.style.setProperty("--cr-stage-h", Math.ceil(top + boardH + bottom + room) + "px");
        setLayout(portrait ? "tablet" : "grid");
      };
      fit();
      window.addEventListener("resize", fit);
      return () => window.removeEventListener("resize", fit);
    }, [stageRef]);
    return layout;
  }

  /* Card order per layout = reading order, so Tab follows what you see */
  const BOARD_ORDER = {
    grid: ["cases", "exp", "date", "orb", "pg", "chat", "np", "hello"],
    tablet: ["orb", "exp", "chat", "pg", "date", "cases", "np", "hello"],
    stack: ["orb", "chat", "cases", "exp", "pg", "date", "np", "hello"],
  };

  /* Design Playground explorations for search: titles and order from the
     playground (window.CraftPlayground.items), categories and one-liners from playground-data.json */
  const PG_ICONS = {
    nomad: "plane", "health-karma": "gauge", swaply: "swap", splitly: "receipt", moov: "card",
    "space-between": "orbits", "loading-range": "loader", "craft-mode": "layers",
  };
  function usePlaygroundJson(CP) {
    const [json, setJson] = useState(null);
    useEffect(() => {
      let live = true;
      if (CP && CP.preload) CP.preload().then((j) => { if (live && j) setJson(j); });
      return () => { live = false; };
    }, [CP]);
    return json;
  }
  function firstSentence(t) {
    if (!t) return "";
    const m = String(t).match(/^.*?[.!?](\s|$)/);
    return (m ? m[0] : t).trim();
  }
  function playgroundWork(CP, json) {
    const byId = {};
    if (json) ["interface", "motion"].forEach((k) => (json[k] || []).forEach((p) => { byId[p.id] = p; }));
    const base = CP && CP.items ? CP.items() : PLAYGROUND.map((p) => ({ id: p.id, title: p.title, image: p.img, kind: p.kind }));
    return base.map((it) => {
      const p = byId[it.id] || {};
      const motion = (it.kind || p.kind) === "motion" || (p.category === "Motion");
      const kindLabel = it.id === "craft-mode" ? "This page" : it.look === "live" ? "Live prototype" : motion ? "Motion" : "Interface";
      let metric = null;
      if (it.duration) metric = { value: it.duration.toFixed(1) + "s", label: "motion study" };
      else if (it.look === "live") metric = { value: "Live", label: "prototype you can try", word: true };
      else if (it.id === "craft-mode") metric = { value: "Now", label: "you are on it", word: true };
      return {
        id: "pg-" + it.id, pgId: it.id, group: "playground",
        title: it.title || p.title || it.id,
        image: (it.crop && it.crop.poster) || it.poster || it.image || (p.preview && p.preview.src),
        video: it.video && !it.crop ? it.video : null, /* Loading Range's poster is a blank frame, so its card plays the clip */
        icon: PG_ICONS[it.id] || "grid", tone: "plain",
        domain: kindLabel,
        summary: firstSentence(p.description || it.description) || (p.category || "Exploration"),
        metric,
        label: "Open " + (it.title || p.title) + " in the Design Playground",
      };
    });
  }

  function CraftHero({ onExit }) {
    const C = window.Craft;
    const stageRef = useRef(null);
    const [sheet, setSheet] = useState(null);
    /* The Resonance popup stays mounted (hidden) after it closes while its prototype has a song,
       so the song keeps playing and the board card works as the mini player */
    const [rsLive, setRsLive] = useState(false);
    const [wallpaper, setWallpaper] = useState(readWallpaper);
    const [picker, setPicker] = useState(false);
    const [hint, setHint] = useState(false);
    const swallowTap = useRef(false); /* the tap that closes the picker shouldn't also change the wallpaper */
    const [shuffleTick, setShuffleTick] = useState(0); /* bumps to restart the timer after a manual change */
    const [playground, setPlayground] = useState(false); /* Design Playground gallery open */
    const pgOpener = useRef(null);
    const [pgBoard, setPgBoard] = useState(null); /* Design Playground on the board: { startId } */
    const [pgBoardOut, setPgBoardOut] = useState(false);
    const openPgBoard = (startId) => { setPicker(false); setSheet(null); setPgBoardOut(false); setPgBoard({ startId: startId || null }); };
    const [pgStart, setPgStart] = useState(null); /* { tab, startId, from } for the next open */
    const [pgClosing, setPgClosing] = useState(false); /* Home is rising back: the top bar tab returns to Home */
    const data = React.useMemo(() => craftData(onExit), [onExit]);
    const CP = window.CraftPlayground;
    const pgJson = usePlaygroundJson(CP);
    const pgWork = React.useMemo(() => playgroundWork(CP, pgJson), [pgJson]); /* playground items for search */

    const layout = useBoardScale(stageRef);
    /* Phones never show the design-notes pill (it would push the board down) */
    const [phone, setPhone] = useState(() => window.matchMedia("(max-width: 700px)").matches);
    useEffect(() => {
      const mq = window.matchMedia("(max-width: 700px)");
      const on = () => setPhone(mq.matches);
      mq.addEventListener("change", on);
      return () => mq.removeEventListener("change", on);
    }, []);
    useEffect(() => { C.motion.enter(stageRef.current, { delay: 300 }); }, []);
    useEffect(() => {
      try { window.localStorage.setItem(CRAFT_WP_KEY, wallpaper); } catch (err) { /* ignore */ }
      preloadWallpaper(nextWallpaper(wallpaper));
    }, [wallpaper]);

    /* Auto shuffle: every 15s, paused while a sheet, the picker or the playground is open, the tab is hidden, or reduced motion is on */
    useEffect(() => {
      if (sheet || picker || playground) return undefined;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
      const id = setInterval(() => {
        if (document.hidden) return;
        setWallpaper((w) => nextWallpaper(w));
      }, CRAFT_WP_INTERVAL);
      return () => clearInterval(id);
    }, [sheet, picker, playground, shuffleTick]);

    /* One-time hint that the wallpaper is tappable */
    useEffect(() => {
      let seen = false;
      try { seen = window.localStorage.getItem(CRAFT_WP_HINT_KEY) === "1"; } catch (err) { /* ignore */ }
      if (seen) return undefined;
      const show = setTimeout(() => setHint(true), 2600);
      const hide = setTimeout(() => setHint(false), 8600);
      return () => { clearTimeout(show); clearTimeout(hide); };
    }, []);

    const changeWallpaper = (id) => {
      setWallpaper(id);
      setShuffleTick((t) => t + 1);
      if (hint) setHint(false);
      try { window.localStorage.setItem(CRAFT_WP_HINT_KEY, "1"); } catch (err) { /* ignore */ }
    };

    const onStageClick = (ev) => {
      if (swallowTap.current) { swallowTap.current = false; return; }
      if (sheet || picker || playground) return;
      if (ev.target.closest && ev.target.closest(CRAFT_WP_IGNORE)) return;
      changeWallpaper(nextWallpaper(wallpaper));
    };
    useEffect(() => {
      if (!picker) return undefined;
      const onKey = (ev) => { if (ev.key === "Escape") setPicker(false); };
      const onDown = (ev) => { if (!ev.target.closest(".cr-dock-wrap")) { swallowTap.current = true; setPicker(false); } };
      window.addEventListener("keydown", onKey);
      document.addEventListener("pointerdown", onDown);
      return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
    }, [picker]);
    useEffect(() => {
      const t = document.querySelector(".cr-hero [aria-label='Change wallpaper']");
      if (t) t.setAttribute("aria-expanded", picker ? "true" : "false");
    }, [picker]);
    useEffect(() => {
      if (!sheet || sheet.kind === "resonance" || sheet.kind === "search" || sheet.kind === "booking") return undefined; /* these sheets animate their own close */
      const onKey = (ev) => { if (ev.key === "Escape") setSheet(null); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [sheet]);

    const fromEvent = (ev) => (ev && ev.currentTarget) || document.activeElement;
    useEffect(() => { if (CP) CP.preload(); }, []);
    /* Projects: the playground component (assets/craft/playground.js) with three tabs.
       opts: { tab: "cases" | "playground" | "ai", startId (a playground item), from (the clicked element) }.
       Home slides down into the bottom sheet from wherever it was opened. */
    const openPlayground = (opts) => {
      const o = opts && !opts.nativeEvent && !opts.currentTarget ? opts : { from: fromEvent(opts) };
      if (!CP || playground) return;
      pgOpener.current = o.from || document.activeElement;
      setPicker(false);
      setSheet(null);
      const mode = o.startId || o.tab === "playground" ? "playground" : "projects";
      setPgStart({ mode, startId: o.startId || null, tab: mode === "playground" ? "playground" : (o.tab || null), from: o.from || null });
      setPgClosing(false);
      setPlayground(true);
    };
    const openProjects = (ev) => openPlayground({ tab: "cases", from: ev && ev.nodeType ? ev : fromEvent(ev) });
    const rsCard = () => stageRef.current && stageRef.current.querySelector(".cr-rp, .cr-np");
    const closePlayground = useCallback((then) => {
      setPlayground(false);
      setPgClosing(false);
      setPgStart(null);
      requestAnimationFrame(() => {
        /* "Open the live prototype" from an AI work: Home is back, now the Resonance popup grows from its card */
        if (then && then.live === "resonance") { setPicker(false); setSheet({ kind: "resonance", opener: rsCard() }); return; }
        const o = pgOpener.current;
        const back = o && o.isConnected && stageRef.current && stageRef.current.contains(o) ? o : stageRef.current && stageRef.current.querySelector("[data-pg-card]");
        if (back) back.focus({ preventScroll: true });
      });
    }, []);
    /* Search + assistant popup (assets/craft/search.js). mode: "search" or "ask" */
    const CS = window.CraftSearch;
    const [pgQueue, setPgQueue] = useState(undefined); /* Projects pick from search: open once the old view is gone */
    const openSearch = (opener, mode) => {
      if (!CS) { openAssistant(); return; }
      setPicker(false);
      setSheet({ kind: "search", opener: opener || null, mode: mode || "search" });
    };
    useEffect(() => {
      if (pgQueue === undefined || playground) return;
      setPgQueue(undefined);
      openPlayground(pgQueue);
    }, [pgQueue, playground]);
    if (CS) CS.useShortcut((btn) => openSearch(btn, "search"), !(sheet && sheet.kind !== "search"));
    const topbar = Object.assign({}, data.topbar, {
      tab: playground && !pgClosing && !(pgStart && pgStart.mode === "playground") ? 1 : 0,
      onTab: (i, label, ev) => { if (pgBoard) { setPgBoard(null); setPgBoardOut(false); } return i === 1 ? openProjects(ev) : setSheet(null); },
      onSearch: CS ? (ev) => openSearch(fromEvent(ev), "search") : openAssistant,
      searchLabel: CS ? "Search the portfolio" : "Ask the portfolio assistant",
      /* Pill only on bare Home: any sheet (search, profile, open Resonance), Projects,
         or phone width hides it. A parked Resonance popup is not a sheet, so the pill comes back. */
      noticeHidden: phone || !!sheet || playground,
    });
    const dock = {
      actions: [
        { icon: "image", label: "Change wallpaper", onClick: () => setPicker((p) => !p) },
        { icon: "download", label: "Download resume", onClick: () => window.open(ASSETS.resume, "_blank", "noopener") },
        { icon: "chat", label: "Ask the portfolio assistant", accent: true, onClick: (ev) => openSearch(fromEvent(ev), "ask") },
      ],
    };

    const CB = window.CraftBooking;
    const openBooking = (el) => { setPicker(false); setSheet({ kind: "booking", opener: el }); };
    const openResonance = (el) => { setPicker(false); setSheet({ kind: "resonance", opener: el }); };
    /* Board cards by slot (placement and order live in craft.css / BOARD_ORDER) */
    const pgCard = () => stageRef.current && stageRef.current.querySelector("[data-pg-card]");
    const boardCards = {
      cases: () => e(C.FolderListCard, Object.assign({}, data.folders, {
        draggable: true,
        /* A row goes to its case page (the arrow link does the same) */
        onOpen: (row, ev) => { if (row.href) window.location.href = row.href; else openProjects(ev); },
        openLabel: (row) => row.title + ", " + row.sub + ". Open case study",
        onAll: (ev) => openProjects(ev),
        allLabel: "View all projects, " + data.caseStudies.length + " case studies",
      })),
      exp: () => e(C.MiniStatCard, Object.assign({}, data.stat, { linkLabel: "View experience in profile", cardLabel: "Experience, 5+ years. Open my experience", onLink: () => setSheet({ kind: "profile", focus: "experience" }), onCard: () => setSheet({ kind: "profile", focus: "experience" }) })),
      /* Date card: date, next free Cal.com slot, status. Tap grows it into the booking sheet. */
      date: () => (CB ? e(CB.AvailabilityCard, {
        config: data.availability,
        meta: data.agenda.day.slice(0, 3) + ", " + data.agenda.meta.replace(/(\d+ \w{3})\w*/, "$1"),
        day: data.agenda.day,
        onOpen: openBooking,
      }) : e(C.AgendaCard, data.agenda)),
      orb: () => e(C.ProfileOrb, Object.assign({}, data.profile, {
        onOpen: () => setSheet({ kind: "profile" }),
        onEdit: () => setSheet({ kind: "profile" }),
        editIcon: "dropper",
        editLabel: "Open profile card",
      })),
      pg: () => e(C.TeamCard, {
        title: "Design Playground",
        subtitle: "Interface and motion studies",
        thumbs: [ASSETS.moov, ASSETS.spaceBetweenPoster, ASSETS.swaply],
        count: 8,
        label: "Open Design Playground, 8 interface and motion studies",
        attrs: { "data-pg-card": "" },
        onOpen: () => openPgBoard(),
        onDrop: () => openProjects(pgCard()),
        dropHint: "Drop to see all projects",
      }),
      chat: () => e(C.PreviewCard, data.preview),
      /* Resonance player ("Create a room" slot). The assistant lives in search (Ask tab) and the dock. */
      np: () => e(C.ResonanceCard, { onOpen: openResonance }),
      hello: () => e(C.ContactCard, { label: "Say hello", slides: data.hello }),
    };

    const stage = e(C.Stage, {
      className: "cr-hero craft-wp--" + wallpaper,
      wallpaper,
      stageRef,
      width: "100vw",
      height: "100vh",
      onClick: onStageClick,
    },
      hint ? e("p", { className: "cr-wp-hint", role: "status" }, "Tap the wallpaper to change it") : null,
      e("h1", { className: "cr-visually-hidden" }, "Gaurav Avinash, Product Designer"),
      e(C.TopBar, topbar),
      e("div", { className: "cr-board" + (pgBoard ? " is-pgb" : "") },
        e("div", { className: "cr-grid" + (sheet && !sheet.closing ? " cr-dimmed" : "") + (pgBoard && !pgBoardOut ? " cr-pg-out" : ""), inert: pgBoard ? "" : undefined },
          BOARD_ORDER[layout].map((slot) => e("div", { key: slot, className: "cr-dim cr-slot cr-slot--" + slot, "data-cr-drop": slot === "pg" ? "" : undefined }, boardCards[slot]()))
        ),
        pgBoard && CP && CP.PlaygroundBoard ? e(CP.PlaygroundBoard, {
          startId: pgBoard.startId,
          onClosing: () => setPgBoardOut(true),
          onClose: () => { setPgBoard(null); setPgBoardOut(false); const c = pgCard(); if (c) c.focus({ preventScroll: true }); },
        }) : null,
        sheet && sheet.kind === "profile" ? e(C.ProfileSheet, Object.assign({
          stageRef, style: {}, focus: sheet.focus, onClose: () => setSheet(null),
        }, data.profileSheet)) : null
      ),
      /* Bottom corners ("+", wallpaper, resume, chat) removed: those actions live in Projects, the profile, Say hello and search. */
      null,
      ((sheet && sheet.kind === "resonance") || rsLive) && C.ResonanceSheet ? e(C.ResonanceSheet, {
        parked: !(sheet && sheet.kind === "resonance"),
        opener: sheet && sheet.kind === "resonance" ? sheet.opener : null,
        onClosing: () => setSheet((s) => (s ? Object.assign({}, s, { closing: true }) : s)),
        onClose: (keep) => { setRsLive(!!keep); setSheet(null); },
      }) : null
    );

    return e(React.Fragment, null,
      stage,
      playground && CP ? e(CP.PlaygroundView, {
        stageRef,
        wallpaper,
        resumeHref: ASSETS.resume,
        onAssistant: CS ? (ev) => openSearch(ev && ev.currentTarget, "ask") : openAssistant,
        onClose: closePlayground,
        onClosing: () => setPgClosing(true),
        startId: pgStart && pgStart.startId,
        tab: pgStart && pgStart.tab,
        mode: pgStart && pgStart.mode,
        from: pgStart && pgStart.from,
        cases: data.caseStudies,
        aiWorks: data.aiWorks,
        onLive: (key) => key === "resonance" && !!C.ResonanceSheet,
      }) : null,
      sheet && sheet.kind === "booking" && CB ? e(CB.BookingSheet, {
        config: data.availability,
        opener: sheet.opener,
        onClosing: () => setSheet((s) => (s ? Object.assign({}, s, { closing: true }) : s)),
        onClose: () => setSheet(null),
      }) : null,
      sheet && sheet.kind === "search" && CS ? e(CS.SearchPopup, {
        mode: sheet.mode,
        opener: sheet.opener,
        cases: data.cases,
        playground: pgWork,
        resumeHref: ASSETS.resume,
        onAllWork: () => {
          if (playground) { setPlayground(false); setPgStart(null); }
          setPgQueue({ tab: "cases", from: stageRef.current && stageRef.current.querySelector(".cr-list .cr-chip--btn") });
        },
        onPlayground: (id) => {
          if (playground) { setPlayground(false); setPgStart(null); }
          openPgBoard(id);
        },
        onClassic: () => onExit(),
        onClosing: () => setSheet((s) => (s ? Object.assign({}, s, { closing: true }) : s)),
        onClose: (then) => { setSheet(null); if (typeof then === "function") requestAnimationFrame(then); },
      }) : null
    );
  }

  function App() {
    const [ready, setReady] = useState(false);
    const [craft, setCraft] = useState(readCraftPref);
    const onSplashDone = useCallback(() => setReady(true), []);
    const pendingScroll = useRef(null);

    useEyes();
    useCoverScroll(ready && !craft);
    useReveals(ready && !craft);

    useEffect(() => {
      document.documentElement.classList.toggle("ga-craft", craft);
      writeCraftPref(craft);
      if (craft) {
        window.scrollTo(0, 0);
        return;
      }
      const target = pendingScroll.current;
      pendingScroll.current = null;
      if (target) {
        requestAnimationFrame(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ block: "start" });
        });
      } else {
        window.scrollTo(0, 0);
      }
    }, [craft]);

    const refocusSwitch = useRef(false);
    const toggleCraft = useCallback(() => { refocusSwitch.current = true; setCraft((c) => !c); }, []);
    useEffect(() => {
      if (!refocusSwitch.current) return;
      refocusSwitch.current = false;
      const sw = document.querySelector(".craft-switch");
      if (sw) sw.focus({ preventScroll: true });
    }, [craft]);
    const exitCraft = useCallback((targetId) => {
      pendingScroll.current = targetId || null;
      setCraft(false);
    }, []);

    const marqueeItems = PLAYGROUND.concat(PLAYGROUND);

    if (craft) {
      return e("div", { className: "ga-root ga-root--craft" },
        e(Splash, { onDone: onSplashDone }),
        e(CraftSwitch, { on: true, onToggle: toggleCraft }),
        e(BrandMark),
        e(CraftHero, { onExit: exitCraft })
      );
    }

    return e("div", { className: "ga-root" },
      e(Splash, { onDone: onSplashDone }),
      e(Nav),
      e(CraftSwitch, { on: false, onToggle: toggleCraft }),
      e(BrandMark),

      e("div", { className: "ga-fold", id: "top" },
        e("header", { className: "ga-hero", "data-screen-label": "Hero" },
          e("h1", { className: "ga-hero-title", "data-plx": "0.32" },
            "A designer who", e("br"),
            "turns complexity", e("br"),
            "into clarity"
          ),
          e("div", { className: "ga-hero-eyes", "aria-hidden": true },
            e("div", { className: "ga-hero-eyes-parallax", "data-plx": "0.18" },
              e(Eye, { sizeClass: "ga-eye-hero" }),
              e(Eye, { sizeClass: "ga-eye-hero" })
            )
          )
        ),

        e("section", { className: "ga-panel--intro", "data-screen-label": "Intro" },
          e("div", { className: "ga-intro-row ga-reveal" },
            e("h2", { className: "ga-intro-heading" }, "Hi! I am Gaurav Avinash"),
            e("div", { className: "ga-intro-actions" },
              e("a", {
                className: "ga-icon-btn",
                href: "https://www.linkedin.com/in/gauravavinash",
                target: "_blank",
                rel: "noreferrer",
                "aria-label": "LinkedIn",
              }, e(Icon, { name: "linkedin" })),
              e("a", {
                className: "ga-icon-btn",
                href: "mailto:gauravavinash3@gmail.com",
                "aria-label": "Email",
              }, e(Icon, { name: "mail" })),
              e("a", {
                className: "ga-pill-btn",
                href: ASSETS.resume,
                target: "_blank",
                rel: "noreferrer",
                title: "Download resume (updated Aug 2026)",
              }, "Resume")
            ),
            e("p", { className: "ga-intro-copy" },
              "Product designer turning complex problems into clear, useful products. ",
              e("strong", { className: "ga-intro-em" }, "5+ years"),
              " across ",
              e("strong", { className: "ga-intro-em" }, "fintech"),
              ", healthtech & foodtech, designing ",
              e("strong", { className: "ga-intro-em" }, "AI"),
              "-powered products, ",
              e("strong", { className: "ga-intro-em" }, "SaaS"),
              " workflows and data-heavy experiences. I work end-to-end, from figuring out the problem to shipping the final product with PMs and engineers."
            )
          )
        ),

        e(FeaturedWork)
      ),

      /* Sticky cover: More work (Design Playground) */
      e("section", {
        className: "ga-cover ga-more-work",
        "data-screen-label": "More work",
        "data-plx-section": "0.07",
        "data-plx-roll": "0.8",
        id: "more-work",
      },
        e("div", { className: "ga-cover-inner" },
          e("div", { className: "ga-more-work-head" },
            e("h2", null, "Design Playground"),
            e("p", null, "Interface explorations and motion studies. Click any piece to open details.")
          ),
          e("div", { className: "ga-marquee-viewport", "aria-label": "Design playground projects" },
            e("div", { className: "ga-marquee-track" },
              marqueeItems.map((item, i) => e(MarqueeTile, {
                item,
                index: i,
                hidden: i >= PLAYGROUND.length,
                key: item.title + "-" + i,
              }))
            )
          )
        )
      ),

      /* Sticky cover: What I bring */
      e("section", {
        className: "ga-cover ga-bring",
        "data-screen-label": "What can I bring",
        "data-plx-section": "0.06",
        "data-plx-roll": "0.6",
      },
        e("div", { className: "ga-cover-inner" },
          e("h2", { className: "ga-bring-title" }, "What can I bring"),
          e("div", { className: "ga-bring-grid" },
            BRING.map((item) => e("article", { className: "ga-bring-item", key: item.title },
              e("span", { className: "ga-bring-icon", "aria-hidden": true }, item.icon),
              e("h3", null, item.title),
              e("p", null, item.body)
            ))
          )
        )
      ),

      /* About - relative scroll (not sticky). cover-inner + plx like Michelle; photo sticks inside. */
      e("section", {
        className: "ga-about",
        id: "about",
        "data-screen-label": "About",
        "data-plx-section": "0.05",
        "data-plx-roll": "0.4",
      },
        e("div", { className: "ga-cover-inner" },
          e("h2", { className: "ga-about-title ga-reveal" }, "About"),
          e("div", { className: "ga-about-grid ga-reveal" },
            e("div", { className: "ga-about-col" },
              e("div", { className: "ga-about-copy" },
                e("p", null, "Product Designer II at Systematic - remote with a New York team on AI-powered B2B SaaS. I specialise in Human–AI interaction design, complex data workflows, and 0→1 product builds."),
                e("p", null, "Known for translating ambiguous problems into intuitive, measurable experiences - improving engagement, reducing drop-off, and accelerating user workflows."),
                e("p", null, "Open to Product Designer roles in B2B SaaS. I solve complex workflows where clarity and measurable outcomes both matter.")
              ),
              e("div", { className: "ga-timeline" },
                TIMELINE.map((block) => e("div", { className: "ga-timeline-block", key: block.heading },
                  e("h3", null, block.heading),
                  block.rows.map((row, i) => e("div", {
                    className: "ga-timeline-row" + (i === 0 ? " ga-timeline-row--first" : ""),
                    key: row.date + row.title,
                  },
                    e("span", { className: "ga-timeline-date" }, row.date),
                    e("div", null,
                      e("p", null, row.title),
                      e("p", null, row.body)
                    )
                  ))
                ))
              )
            ),
            e("figure", { className: "ga-about-photo" },
              e("div", { className: "ga-about-photo-stack", "aria-label": "About photos" },
                e("img", {
                  className: "ga-about-photo-slide is-secondary",
                  src: ASSETS.profileFriends,
                  alt: "Gaurav with friends outdoors",
                  loading: "lazy",
                  decoding: "async",
                }),
                e("img", {
                  className: "ga-about-photo-slide is-primary",
                  src: ASSETS.profile,
                  alt: "Gaurav Avinash portrait",
                  decoding: "async",
                })
              )
            )
          )
        )
      ),

      /* Sticky cover: Contact */
      e("section", {
        className: "ga-cover ga-contact",
        id: "contact",
        "data-screen-label": "Contact",
        "data-plx-section": "0.05",
        "data-plx-roll": "0.5",
      },
        e("div", { className: "ga-cover-inner" },
          e("div", { className: "ga-contact-grid" },
            e("div", null,
              e("p", { className: "ga-eyebrow" }, e("span", { className: "ga-eyebrow-dot" }), "Get in touch"),
              e("div", { className: "ga-contact-eyes", "aria-hidden": true },
                e(Eye, { sizeClass: "ga-eye-contact" }),
                e(Eye, { sizeClass: "ga-eye-contact" })
              ),
              e("h2", { className: "ga-contact-title" },
                "Let's build something ",
                e("em", null, "that ships.")
              ),
              e("p", { className: "ga-contact-sub" },
                "Open to Product Designer roles in B2B SaaS. I solve complex workflows where clarity and measurable outcomes both matter."
              )
            ),
            e("div", { className: "ga-contact-links" },
              e("a", { className: "ga-contact-link", href: "mailto:gauravavinash3@gmail.com" },
                e("div", null,
                  e("div", { className: "ga-contact-link-label" }, "gauravavinash3@gmail.com"),
                  e("div", { className: "ga-contact-link-meta" }, "Email · Best way to reach me")
                ),
                e("span", null, "↗")
              ),
              e("a", {
                className: "ga-contact-link",
                href: "https://www.linkedin.com/in/gauravavinash",
                target: "_blank",
                rel: "noreferrer",
              },
                e("div", null,
                  e("div", { className: "ga-contact-link-label" }, "LinkedIn"),
                  e("div", { className: "ga-contact-link-meta" }, "www.linkedin.com/in/gauravavinash")
                ),
                e("span", null, "↗")
              ),
              e("a", { className: "ga-contact-link", href: "tel:+918527386404" },
                e("div", null,
                  e("div", { className: "ga-contact-link-label" }, "Phone"),
                  e("div", { className: "ga-contact-link-meta" }, "+91 8527386404")
                ),
                e("span", null, "↗")
              ),
              e("a", {
                className: "ga-contact-link",
                href: ASSETS.resume,
                target: "_blank",
                rel: "noreferrer",
                download: "Gaurav-Avinash-Resume-Aug-2026.pdf",
              },
                e("div", null,
                  e("div", { className: "ga-contact-link-label" }, "Download Resume"),
                  e("div", { className: "ga-contact-link-meta" }, "Updated Aug 2026")
                ),
                e("span", null, "↓")
              )
            )
          ),
          e("p", { className: "ga-site-credit" },
            "This Portfolio is built with pure HTML / CSS / JS. Co-built with ",
            e("a", { href: "https://cursor.com", target: "_blank", rel: "noreferrer" }, "Cursor"),
            " & ",
            e("a", { href: "https://claude.ai", target: "_blank", rel: "noreferrer" }, "Claude"),
            ". Hosted on ",
            e("a", {
              className: "ga-site-credit-gh",
              href: "https://github.com/gauravavinash44-blip/portfolio",
              target: "_blank",
              rel: "noreferrer",
            },
              "GitHub",
              e("svg", {
                viewBox: "0 0 16 16",
                width: "14",
                height: "14",
                "aria-hidden": "true",
                focusable: "false",
              },
                e("path", {
                  fill: "currentColor",
                  d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z",
                })
              )
            ),
            "."
          )
        )
      ),

      e("footer", { className: "ga-footer" },
        e("div", { className: "ga-footer-inner" },
          "Gaurav Avinash · Product Designer · UX/AI Design · 4+ years · AI B2B SaaS · Human–AI interaction · © " + new Date().getFullYear()
        )
      )
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));
})();
