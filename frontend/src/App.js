import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled, { createGlobalStyle } from "styled-components";

// Если у вас есть файл шрифта Edgy Typeface, поместите его в public/fonts/ и раскомментируйте @font-face ниже
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Edgy';
    src: url('/fonts/EdgyTypeface.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Edgy', Arial, sans-serif;
    background: #181a20;
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
  }
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const Character = styled(motion.img)`
  position: absolute;
  bottom: 0;
  width: 160px;
  max-width: 40vw;
  z-index: 2;
`;

const Logo = styled(motion.div)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-family: 'Edgy', Arial, sans-serif;
  font-weight: bold;
  letter-spacing: 2px;
  color: #fff;
  background: rgba(24,26,32,0.85);
  border-radius: 1.5rem;
  padding: 1.2rem 2.5rem;
  box-shadow: 0 0 40px 10px #fff8, 0 2px 8px #000a;
  cursor: pointer;
  z-index: 10;
`;

const Flash = styled(motion.div)`
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  background: radial-gradient(circle, #fff 0%, #fff0 80%);
  z-index: 9;
`;

const RegisterPrompt = styled(motion.div)`
  position: absolute;
  left: 50%;
  top: 55%;
  transform: translate(-50%, -50%);
  background: #23263aee;
  border-radius: 1.5rem;
  padding: 2rem 2.5rem;
  box-shadow: 0 0 24px 4px #000a;
  text-align: center;
  z-index: 20;
`;

const RegisterButton = styled.button`
  margin-top: 1.2rem;
  padding: 0.8rem 2.2rem;
  font-size: 1.2rem;
  font-family: 'Edgy', Arial, sans-serif;
  background: linear-gradient(90deg, #ff6a00, #ee0979);
  color: #fff;
  border: none;
  border-radius: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(90deg, #ee0979, #ff6a00);
  }
`;

const FormOverlay = styled(motion.div)`
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(24,26,32,0.92);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RegisterForm = styled.form`
  background: #23263a;
  border-radius: 1.5rem;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  box-shadow: 0 0 24px 4px #000a;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
`;

const Input = styled.input`
  width: 90%;
  margin: 0.7rem 0;
  padding: 0.8rem 1rem;
  border-radius: 0.8rem;
  border: 1px solid #444;
  font-size: 1.1rem;
  font-family: 'Edgy', Arial, sans-serif;
  background: #181a20;
  color: #fff;
`;

const Cabinet = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 2rem;
  font-family: 'Edgy', Arial, sans-serif;
  z-index: 200;
`;

// Заглушки для персонажей (замените на свои SVG/PNG)
const boyImg = "https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/boy.svg";
const girlImg = "https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/girl.svg";

export default function App() {
  // Проверяем регистрацию и шаг
  const [step, setStepState] = useState(() => {
    const registered = localStorage.getItem('edaivi_registered');
    if (registered === 'true') return 4; // сразу кабинет
    const saved = localStorage.getItem('edaivi_step');
    return saved !== null ? Number(saved) : 0;
  });
  const setStep = (val) => {
    setStepState(val);
    localStorage.setItem('edaivi_step', val);
    if (val === 4) localStorage.setItem('edaivi_registered', 'true');
  };
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Анимация встречи персонажей и появление логотипа
  React.useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 6000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Вспышка появляется после анимации логотипа
  const [flash, setFlash] = useState(false);
  // flash теперь запускается вручную после анимации логотипа

  // Анимация перемещения логотипа
  const [logoMoved, setLogoMoved] = useState(false);

  // Обработка формы
  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFormSubmit = e => {
    e.preventDefault();
    setStep(4); // Переход в личный кабинет (заглушка)
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        {/* Персонажи */}
        <AnimatePresence>
          {step === 0 && (
            <>
              <Character
                src={boyImg}
                alt="boy"
                initial={{ x: "-40vw", opacity: 0 }}
                animate={{ x: "calc(50vw - 120px)", opacity: 1 }}
                exit={{ opacity: 0, x: "-40vw" }}
                transition={{ duration: 2.5 }}
                style={{ bottom: 0, left: 0 }}
              />
              <Character
                src={girlImg}
                alt="girl"
                initial={{ x: "40vw", opacity: 0 }}
                animate={{ x: "calc(50vw + 40px)", opacity: 1 }}
                exit={{ opacity: 0, x: "40vw" }}
                transition={{ duration: 2.5 }}
                style={{ bottom: 0, right: 0 }}
              />
            </>
          )}
        </AnimatePresence>
        {/* Логотип */}
        <AnimatePresence>
          {(step === 1 || logoMoved) && (
            <Logo
              initial={{ scale: 0, opacity: 0 }}
              animate={logoMoved ? {
                left: "2.5rem",
                top: "2.5rem",
                transform: "translate(0,0)",
                scale: 0.7,
                fontSize: "2rem",
                boxShadow: "0 0 12px 2px #fff8, 0 2px 8px #000a"
              } : {
                scale: 1,
                opacity: 1,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "3rem"
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              onAnimationComplete={() => {
                if (step === 1 && !logoMoved) {
                  setFlash(true);
                  setTimeout(() => setFlash(false), 700);
                }
              }}
              onClick={() => {
                if (!logoMoved) {
                  setLogoMoved(true);
                  setTimeout(() => setStep(2), 900);
                }
              }}
            >
              EdAiviStudio
            </Logo>
          )}
        </AnimatePresence>
        {/* Вспышка */}
        <AnimatePresence>
          {flash && (
            <Flash
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          )}
        </AnimatePresence>
        {/* Предложение зарегистрироваться */}
        <AnimatePresence>
          {step === 2 && (
            <RegisterPrompt
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.7 }}
            >
              <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.2rem", letterSpacing: "1px" }}>
                Зарегистрироваться
              </div>
              <div style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "#ff6a00", fontWeight: 500, letterSpacing: "0.5px" }}>
                твои мечты — это реальность, начни творить вместе с AI
              </div>
              <RegisterButton onClick={() => setStep(3)}>
                Зарегистрироваться
              </RegisterButton>
            </RegisterPrompt>
          )}
        </AnimatePresence>
        {/* Форма регистрации */}
        <AnimatePresence>
          {step === 3 && (
            <FormOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RegisterForm onSubmit={handleFormSubmit}>
                <div style={{ fontSize: "1.3rem", marginBottom: "1.2rem" }}>Регистрация</div>
                <Input
                  name="name"
                  type="text"
                  placeholder="Имя"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Электронная почта"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Пароль"
                  value={form.password}
                  onChange={handleFormChange}
                  required
                />
                <RegisterButton type="submit">Зарегистрироваться</RegisterButton>
              </RegisterForm>
            </FormOverlay>
          )}
        </AnimatePresence>
        {/* Личный кабинет (заглушка) */}
        <AnimatePresence>
          {step === 4 && (
            <Cabinet
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              Добро пожаловать, {form.name || "пользователь"}!
            </Cabinet>
          )}
        </AnimatePresence>
      </Container>
    </>
  );
}
