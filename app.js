(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const e = React.createElement;

  const ASSETS = {
    profile: "./assets/profile.png",
    profileFriends: "./assets/about-friends.png",
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
  const CRAFT_WP_INTERVAL = 20000; /* auto shuffle, like macOS dynamic wallpapers */
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

  function craftData(onExit) {
    const C = window.Craft;
    const S = C.sample({
      profile: ASSETS.profile, logo: ASSETS.logo, chat: ASSETS.chat, dealRoom: ASSETS.dealRoom,
      easyeat: ASSETS.easyeat, whiteLabel: ASSETS.whiteLabel, resonance: ASSETS.resonance,
      nomad: ASSETS.nomad, health: ASSETS.health, swaply: ASSETS.swaply, splitly: ASSETS.splitly,
      avatar: "./assets/craft/avatar/gaurav-3d-face.webp",
      avatarHero: "./assets/craft/avatar/gaurav-3d-visor.webp",
    });
    const hrefs = {
      "Contextual Chat": "./craft-contextual-chat.html",
      "Deal Room": "./deal-room-short.html",
      "White Label": "./white-label-short.html",
      "White Label Setup": "./white-label-short.html",
      "EasyEat": "./easyeat-case-study.html",
      "Resonance": "./resonance-short.html",
    };
    S.files = S.files.map((f) => (hrefs[f.title]
      ? Object.assign({}, f, { href: hrefs[f.title] })
      : Object.assign({}, f, { onClick: () => onExit("more-work") })));
    S.folders.rows = S.folders.rows.map((r) => Object.assign({}, r, { href: hrefs[r.title] }));
    S.preview.href = hrefs["Contextual Chat"];
    S.topbar.notice.href = hrefs["Contextual Chat"];
    S.stat.onLink = () => onExit("work");
    S.stack.onClick = () => onExit("more-work");
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

  function useBoardScale(stageRef) {
    useEffect(() => {
      const fit = () => {
        const el = stageRef.current;
        if (!el) return;
        const w = window.innerWidth, h = window.innerHeight;
        // Mobile: CSS stacks the cards in a scrolling column, no scaling.
        if (w <= 700) {
          el.dataset.crFit = "stack";
          el.style.removeProperty("--cr-scale");
          return;
        }
        // Desktop: the reference dashboard is a 1280 x 853 canvas, so the board
        // scales with the smaller of the two ratios and CSS places it like the
        // reference (68% of the free height above the grid).
        if (w >= 1100 && h >= 700) {
          delete el.dataset.crFit;
          delete el.dataset.crCols;
          el.style.removeProperty("--cr-stage-h");
          el.style.removeProperty("--cr-board-top");
          const scale = Math.min(1.15, w / 1280, h / 853);
          el.style.setProperty("--cr-scale", Math.max(0.55, scale).toFixed(3));
          return;
        }
        // Tablet or short screens: fit between the top bar and the corners,
        // 2 columns in portrait, and scroll instead of shrinking past 0.68.
        const cols = w < 1100 && h > w ? 2 : 3;
        const bw = cols === 2 ? 605 : 919, bh = cols === 2 ? 919 : 605;
        const top = w < 1100 ? 168 : 104, bottom = 112;
        let scale = Math.min(1.12, (w - 64) / bw, (h - top - bottom) / bh);
        scale = Math.max(Math.min(0.68, (w - 64) / bw), scale);
        const boardH = bh * scale;
        const room = Math.max(0, h - top - bottom - boardH);
        el.dataset.crFit = "flow";
        el.dataset.crCols = String(cols);
        el.style.setProperty("--cr-scale", scale.toFixed(3));
        el.style.setProperty("--cr-board-top", Math.round(top + room / 2) + "px");
        el.style.setProperty("--cr-stage-h", Math.ceil(top + boardH + bottom + room) + "px");
      };
      fit();
      window.addEventListener("resize", fit);
      return () => window.removeEventListener("resize", fit);
    }, [stageRef]);
  }

  function CraftHero({ onExit }) {
    const C = window.Craft;
    const stageRef = useRef(null);
    const [sheet, setSheet] = useState(null);
    const [wallpaper, setWallpaper] = useState(readWallpaper);
    const [picker, setPicker] = useState(false);
    const [hint, setHint] = useState(false);
    const swallowTap = useRef(false); /* the tap that closes the picker shouldn't also change the wallpaper */
    const [shuffleTick, setShuffleTick] = useState(0); /* bumps to restart the timer after a manual change */
    const data = React.useMemo(() => craftData(onExit), [onExit]);

    useBoardScale(stageRef);
    useEffect(() => { C.motion.enter(stageRef.current, { delay: 300 }); }, []);
    useEffect(() => {
      try { window.localStorage.setItem(CRAFT_WP_KEY, wallpaper); } catch (err) { /* ignore */ }
      preloadWallpaper(nextWallpaper(wallpaper));
    }, [wallpaper]);

    /* Auto shuffle: every 20s, paused while a sheet or the picker is open, the tab is hidden, or reduced motion is on */
    useEffect(() => {
      if (sheet || picker) return undefined;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
      const id = setInterval(() => {
        if (document.hidden) return;
        setWallpaper((w) => nextWallpaper(w));
      }, CRAFT_WP_INTERVAL);
      return () => clearInterval(id);
    }, [sheet, picker, shuffleTick]);

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
      if (sheet || picker) return;
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
      if (!sheet) return undefined;
      const onKey = (ev) => { if (ev.key === "Escape") setSheet(null); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [sheet]);

    const openFolder = (from) => setSheet({ kind: "folder", from: from || "list" });
    const topbar = Object.assign({}, data.topbar, {
      tab: sheet && sheet.kind === "folder" ? 1 : 0,
      onTab: (i) => (i === 1 ? openFolder("list") : setSheet(null)),
      onSearch: openAssistant,
      searchLabel: "Ask the portfolio assistant",
    });
    const dock = {
      actions: [
        { icon: "image", label: "Change wallpaper", onClick: () => setPicker((p) => !p) },
        { icon: "download", label: "Download resume", onClick: () => window.open(ASSETS.resume, "_blank", "noopener") },
        { icon: "chat", label: "Ask the portfolio assistant", accent: true, onClick: openAssistant },
      ],
    };

    return e(C.Stage, {
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
      e("div", { className: "cr-board" },
        e("div", { className: "cr-grid" + (sheet ? " cr-dimmed" : "") },
          e("div", { className: "cr-dim" }, e(C.AgendaCard, data.agenda)),
          e("div", { className: "cr-dim" }, e(C.FolderListCard, Object.assign({}, data.folders, {
            draggable: true,
            onOpen: () => openFolder("list"),
          }))),
          e("div", { className: "cr-dim", "data-cr-drop": "" }, e(C.DropZoneCard, Object.assign({}, data.drop, {
            onDrop: () => openFolder("drop"),
            onClick: () => openFolder("drop"),
          }))),
          e("div", { className: "cr-dim" }, e(C.PreviewCard, data.preview)),
          e("div", { className: "cr-dim" }, e(C.ProfileOrb, Object.assign({}, data.profile, {
            onOpen: () => setSheet({ kind: "profile" }),
            onEdit: () => setSheet({ kind: "profile" }),
            editIcon: "dropper",
            editLabel: "Open profile card",
          }))),
          e("div", { className: "cr-dim" }, e(C.StatCard, data.stat))
        ),
        sheet && sheet.kind === "folder" ? e(C.FolderSheet, {
          stageRef, from: sheet.from, folder: data.folder, files: data.files, style: {},
          onClose: () => setSheet(null),
        }) : null,
        sheet && sheet.kind === "profile" ? e(C.ProfileSheet, Object.assign({
          stageRef, style: {}, onClose: () => setSheet(null),
        }, data.profileSheet)) : null
      ),
      e("div", { className: "cr-corners" },
      e("div", { className: "cr-corner cr-corner--left" }, e(C.AvatarStack, data.stack)),
      e("div", { className: "cr-corner cr-corner--right cr-dock-wrap" },
        picker ? e("div", { className: "cr-wp-picker cr-glass-light", role: "group", "aria-label": "Wallpapers" },
          CRAFT_WALLPAPERS.map((w) => e("button", {
            key: w.id,
            type: "button",
            className: "cr-wp-thumb craft-wp--" + w.id,
            "aria-label": w.label,
            "aria-pressed": wallpaper === w.id ? "true" : "false",
            title: w.label,
            onClick: () => changeWallpaper(w.id),
          }))
        ) : null,
        e(C.Dock, dock)
      ))
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
