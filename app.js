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

  const CRAFT_MORE = [
    { href: "./easyeat-case-study.html", img: ASSETS.easyeat, title: "EasyEat", meta: "FoodTech" },
    { href: "./deal-room-short.html", img: ASSETS.dealRoom, title: "Deal Room", meta: "B2B SaaS" },
    { href: "./white-label-short.html", img: ASSETS.whiteLabel, title: "White Label", meta: "Fintech" },
    { href: "./resonance-short.html", img: ASSETS.resonance, title: "Resonance", meta: "AI · Music" },
  ];

  const CRAFT_TOOLS = [
    { short: "Fi", name: "Figma", tint: "#f3e6ff" },
    { short: "Gp", name: "ChatGPT", tint: "#e3f4ee" },
    { short: "Mj", name: "Midjourney", tint: "#ecebf3" },
    { short: "No", name: "Notion", tint: "#f2f2f0" },
    { short: "Ps", name: "Photoshop", tint: "#e2eefc" },
    { short: "Ae", name: "After Effects", tint: "#ece6fb" },
    { short: "Pc", name: "Procreate", tint: "#fbe9e4" },
    { short: "VS", name: "VS Code", tint: "#e3effa" },
  ];

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

  function CraftWallpaper() {
    return e("div", { className: "craft-wallpaper", "aria-hidden": "true" },
      e("svg", { className: "craft-wallpaper-scene", viewBox: "0 0 1600 1000", preserveAspectRatio: "xMidYMid slice" },
        e("defs", null,
          e("linearGradient", { id: "cwSky", x1: 0, y1: 0, x2: 0, y2: 1 },
            e("stop", { offset: "0", stopColor: "#8d90b6" }),
            e("stop", { offset: "0.34", stopColor: "#b3a7c9" }),
            e("stop", { offset: "0.52", stopColor: "#dcbcca" }),
            e("stop", { offset: "0.62", stopColor: "#f1cdc0" })
          ),
          e("linearGradient", { id: "cwSea", x1: 0, y1: 0, x2: 0, y2: 1 },
            e("stop", { offset: "0", stopColor: "#d9bfc8" }),
            e("stop", { offset: "0.35", stopColor: "#a99bbb" }),
            e("stop", { offset: "1", stopColor: "#6f6890" })
          ),
          e("radialGradient", { id: "cwSun", cx: 0.66, cy: 0.58, r: 0.38 },
            e("stop", { offset: "0", stopColor: "#fff1dc", stopOpacity: 0.95 }),
            e("stop", { offset: "0.45", stopColor: "#f7d6c4", stopOpacity: 0.45 }),
            e("stop", { offset: "1", stopColor: "#f7d6c4", stopOpacity: 0 })
          ),
          e("linearGradient", { id: "cwShine", x1: 0, y1: 0, x2: 0, y2: 1 },
            e("stop", { offset: "0", stopColor: "#fff3e6", stopOpacity: 0.85 }),
            e("stop", { offset: "1", stopColor: "#fff3e6", stopOpacity: 0 })
          ),
          e("filter", { id: "cwBlurFar" }, e("feGaussianBlur", { stdDeviation: 7 })),
          e("filter", { id: "cwBlurMid" }, e("feGaussianBlur", { stdDeviation: 3.5 })),
          e("filter", { id: "cwBlurNear" }, e("feGaussianBlur", { stdDeviation: 1.6 })),
          e("filter", { id: "cwGrain" },
            e("feTurbulence", { type: "fractalNoise", baseFrequency: 0.9, numOctaves: 2, stitchTiles: "stitch" }),
            e("feColorMatrix", { values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" })
          )
        ),
        e("rect", { width: 1600, height: 1000, fill: "url(#cwSky)" }),
        e("rect", { width: 1600, height: 1000, fill: "url(#cwSun)" }),
        /* far ridge */
        e("path", {
          filter: "url(#cwBlurFar)", fill: "#b4a2c2", opacity: 0.8,
          d: "M0 560 C120 520 220 470 340 492 C430 508 500 470 600 486 C700 502 760 540 860 548 C980 556 1080 528 1200 538 C1320 548 1460 520 1600 534 L1600 640 L0 640 Z",
        }),
        /* sea */
        e("rect", { y: 600, width: 1600, height: 400, fill: "url(#cwSea)" }),
        e("ellipse", { cx: 1056, cy: 690, rx: 70, ry: 150, fill: "url(#cwShine)", filter: "url(#cwBlurMid)", opacity: 0.7 }),
        /* left canyon headland */
        e("path", {
          filter: "url(#cwBlurMid)", fill: "#8b7aa1",
          d: "M0 420 C70 418 140 440 210 476 C290 516 350 560 420 600 C470 628 520 646 560 660 L560 700 L0 700 Z",
        }),
        e("path", {
          filter: "url(#cwBlurNear)", fill: "#6c5f86",
          d: "M0 520 C80 520 150 548 220 590 C280 626 330 660 380 690 C330 720 220 760 0 780 Z",
        }),
        /* right headland */
        e("path", {
          filter: "url(#cwBlurMid)", fill: "#7d6f98",
          d: "M1600 560 C1520 560 1450 588 1390 620 C1340 646 1300 664 1250 676 L1600 700 Z",
        }),
        /* foreground shore */
        e("path", {
          filter: "url(#cwBlurNear)", fill: "#4f4768", opacity: 0.85,
          d: "M0 900 C220 860 420 872 640 900 C860 928 1100 904 1320 872 C1440 856 1530 860 1600 868 L1600 1000 L0 1000 Z",
        }),
        e("rect", { width: 1600, height: 1000, filter: "url(#cwGrain)", opacity: 0.6 })
      ),
      e("div", { className: "craft-wallpaper-photo" }),
      e("div", { className: "craft-wallpaper-veil" })
    );
  }

  function useIstClock() {
    const fmt = () => {
      try {
        return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());
      } catch (err) {
        return "";
      }
    };
    const [time, setTime] = useState(fmt);
    useEffect(() => {
      const id = setInterval(() => setTime(fmt()), 15000);
      return () => clearInterval(id);
    }, []);
    return time;
  }

  function CraftCard({ num, label, area, tone, children, extraClass }) {
    return e("section", {
      className: "craft-card craft-card--" + (tone || "glass") + " craft-area-" + area + (extraClass ? " " + extraClass : ""),
      "aria-label": label,
    },
      e("header", { className: "craft-card-head" },
        e("span", { className: "craft-card-num" }, num),
        e("span", { className: "craft-card-label" }, label)
      ),
      children
    );
  }

  function CraftFeaturedMedia() {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      return e("img", { src: ASSETS.chatMotionPoster, alt: "", decoding: "async" });
    }
    return e("video", {
      src: ASSETS.chatMotion,
      poster: ASSETS.chatMotionPoster,
      muted: true,
      autoPlay: true,
      loop: true,
      playsInline: true,
      preload: "metadata",
      "aria-hidden": "true",
      tabIndex: -1,
    });
  }

  function CraftMusic() {
    const [playing, setPlaying] = useState(false);
    return e("div", { className: "craft-dock-item craft-music" + (playing ? " is-playing" : "") },
      e("div", { className: "craft-music-art", "aria-hidden": "true" },
        e("span", { className: "craft-eq" }, e("i"), e("i"), e("i"), e("i"))
      ),
      e("div", { className: "craft-music-text" },
        e("p", { className: "craft-music-title" }, "Good Design, Better Days"),
        e("p", { className: "craft-music-sub" }, "On repeat while I work"),
        e("span", { className: "craft-music-bar", "aria-hidden": "true" }, e("span"))
      ),
      e("button", {
        type: "button",
        className: "craft-music-btn",
        "aria-pressed": playing ? "true" : "false",
        "aria-label": playing ? "Pause the music widget animation" : "Play the music widget animation",
        onClick: () => setPlaying((p) => !p),
      },
        playing
          ? e("svg", { viewBox: "0 0 24 24", width: 16, height: 16, "aria-hidden": "true" },
            e("rect", { x: 6, y: 5, width: 4, height: 14, rx: 1.2, fill: "currentColor" }),
            e("rect", { x: 14, y: 5, width: 4, height: 14, rx: 1.2, fill: "currentColor" }))
          : e("svg", { viewBox: "0 0 24 24", width: 16, height: 16, "aria-hidden": "true" },
            e("path", { d: "M8 5.5v13l11-6.5z", fill: "currentColor" }))
      )
    );
  }

  function CraftLanding({ onExit }) {
    const time = useIstClock();
    const lead = FEATURED[0];

    const openAssistant = () => {
      const fab = document.getElementById("paFab");
      if (fab) fab.click();
    };

    return e("main", { className: "craft", id: "top", "aria-label": "Gaurav Avinash, Craft mode" },
      e(CraftWallpaper),

      e("div", { className: "craft-topbar" },
        e("div", { className: "craft-pill craft-pill--id" },
          e("span", { className: "craft-eyes", "aria-hidden": "true" }, e(Eye, { sizeClass: "craft-eye" }), e(Eye, { sizeClass: "craft-eye" })),
          e("span", { className: "craft-clock" }, time, e("small", null, "IST")),
          e("span", { className: "craft-divider", "aria-hidden": "true" }),
          e("span", { className: "craft-place" }, "New Delhi, India")
        ),
        e("div", { className: "craft-pill craft-pill--status" },
          e("span", { className: "craft-dot", "aria-hidden": "true" }),
          "Available for opportunities"
        )
      ),

      e("div", { className: "craft-board" },
        /* 01 Profile */
        e(CraftCard, { num: "01", label: "Profile", area: "profile", tone: "photo" },
          e("img", { className: "craft-profile-photo", src: ASSETS.profile, alt: "Portrait of Gaurav Avinash", decoding: "async" }),
          e("div", { className: "craft-profile-copy" },
            e("h1", { className: "craft-profile-name" }, "Hi, I’m Gaurav"),
            e("p", { className: "craft-profile-role" }, "Product Designer"),
            e("p", { className: "craft-profile-place" }, "Delhi, India"),
            e("p", { className: "craft-profile-motto" }, "Design · Build · Explore · Repeat")
          )
        ),

        /* 02 Featured work */
        e(CraftCard, { num: "02", label: "Featured Work", area: "featured", tone: "solid" },
          e("a", { className: "craft-featured", href: lead.href },
            e("div", { className: "craft-featured-media" }, e(CraftFeaturedMedia)),
            e("div", { className: "craft-featured-copy" },
              e("ul", { className: "craft-tags", "aria-label": "Tags" },
                ["SaaS", "AI", "Enterprise"].map((t) => e("li", { key: t }, t))
              ),
              e("h2", { className: "craft-featured-title" }, "Contextual chat for investor discovery"),
              e("p", { className: "craft-featured-sub" }, "Search went from 30–40 minutes to under 30 seconds."),
              e("span", { className: "craft-featured-cta" }, "Read case study", e("span", { "aria-hidden": "true" }, " ↗"))
            )
          )
        ),

        /* 03 More work */
        e(CraftCard, { num: "03", label: "More Work", area: "more", tone: "glass" },
          e("div", { className: "craft-more-grid" },
            CRAFT_MORE.map((p) => e("a", { key: p.title, className: "craft-tile", href: p.href },
              e("img", { src: p.img, alt: "", decoding: "async", loading: "lazy" }),
              e("span", { className: "craft-tile-name" }, p.title, e("small", null, p.meta))
            )),
            e("button", {
              type: "button",
              className: "craft-tile craft-tile--playground",
              onClick: () => onExit("more-work"),
              "aria-label": "Open Design Playground in the classic portfolio",
            },
              e("span", { className: "craft-tile-stack", "aria-hidden": "true" }, e("i"), e("i"), e("i")),
              e("span", { className: "craft-tile-name" }, "Design Playground", e("small", null, "Opens classic view"))
            )
          )
        ),

        /* 04 Currently */
        e(CraftCard, { num: "04", label: "Currently", area: "current", tone: "glass" },
          e("div", { className: "craft-current" },
            e("div", null,
              e("p", { className: "craft-current-status" }, e("span", { className: "craft-dot", "aria-hidden": "true" }), "Open to opportunities"),
              e("p", { className: "craft-current-role" }, "Senior Product Designer"),
              e("p", { className: "craft-current-when" }, "Available immediately")
            ),
            e("p", { className: "craft-current-stat" }, "5+", e("small", null, "years designing products"))
          )
        ),

        /* 05 Tools */
        e(CraftCard, { num: "05", label: "Tools", area: "tools", tone: "glass" },
          e("ul", { className: "craft-tools" },
            CRAFT_TOOLS.map((t) => e("li", { key: t.name, title: t.name },
              e("span", { className: "craft-tool-icon", style: { background: t.tint }, "aria-hidden": "true" }, t.short),
              e("span", { className: "craft-tool-name" }, t.name)
            ))
          )
        ),

        /* 06 Quick links */
        e(CraftCard, { num: "06", label: "Quick Links", area: "links", tone: "solid" },
          e("div", { className: "craft-links" },
            e("a", { className: "craft-link", href: ASSETS.resume, target: "_blank", rel: "noreferrer" }, "Resume", e("span", { "aria-hidden": "true" }, "↓")),
            e("a", { className: "craft-link", href: "mailto:gauravavinash3@gmail.com" }, "Email", e("span", { "aria-hidden": "true" }, "↗")),
            e("a", { className: "craft-link", href: "https://www.linkedin.com/in/gauravavinash", target: "_blank", rel: "noreferrer" }, "LinkedIn", e("span", { "aria-hidden": "true" }, "↗")),
            e("button", { type: "button", className: "craft-link", onClick: openAssistant }, "Chat", e("span", { "aria-hidden": "true" }, "✦"))
          )
        )
      ),

      e("div", { className: "craft-dock" },
        e(CraftMusic),
        e("figure", { className: "craft-dock-item craft-quote" },
          e("blockquote", null, "I design products that make complex things feel simple.")
        ),
        e("div", { className: "craft-dock-item craft-outside" },
          e("img", { src: ASSETS.profileFriends, alt: "", decoding: "async", loading: "lazy" }),
          e("div", null,
            e("p", { className: "craft-outside-label" }, "Outside of work"),
            e("p", { className: "craft-outside-list" }, "Tennis · Music · Dancing")
          )
        )
      )
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

    const toggleCraft = useCallback(() => setCraft((c) => !c), []);
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
        e(CraftLanding, { onExit: exitCraft })
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
