"use client";
import { signOut } from "next-auth/react";
import { LogOut, Globe } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n-provider";

export function Header({ user }: { user: any }) {
  const i18n = useI18n();
  const locale = i18n ? i18n.locale : "vi";
  const setLocale = i18n ? i18n.setLocale : function () {};
  const languages = i18n && i18n.languages ? i18n.languages : [];
  const t = i18n && i18n.t ? i18n.t : function (k: string) { return k; };
  const [show, setShow] = useState(false);

  const langs = languages && languages.length > 0
    ? languages
      : [{ code: "vi", name: "Tiếng Việt", flag: "VN" }];

  const cur = langs.find((l: any) => l.code === locale) || null;

  function switchLang(code: string) {
    if (code === locale) return;
    setLocale(code);
    setShow(false);
    setTimeout(function () {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 100);
  }

  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div></div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={function () { setShow(!show); }}
            className="flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-gray-50 text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{(cur && cur.flag) || "🌐"} {(cur && cur.code || "").toUpperCase()}</span>
          </button>
          {show ? (
            <div
              className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-50 min-w-[150px]"
              onMouseLeave={function () { setShow(false); }}
            >
              {langs.map(function (l: any) {
                return (
                  <button
                    key={l.code}
                    onClick={function () { switchLang(l.code); }}
                    className={
                      "block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 " +
                      (l.code === locale ? "bg-blue-50 font-medium" : "")
                    }
                  >
                    {l.flag} {l.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
          {user.name && user.name[0] ? user.name[0].toUpperCase() : "?"}
        </div>
        <button
          onClick={function () { signOut({ callbackUrl: "/login" }); }}
          className="p-2 hover:bg-red-50 rounded-full text-red-600"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
